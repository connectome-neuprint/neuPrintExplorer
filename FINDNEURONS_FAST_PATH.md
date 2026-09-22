# The FindNeurons fast search path

How the neuron autocomplete in `NeuronInputField.jsx` decides between two
queries, what a server has to provide before the faster one is safe, and why
the check is stricter than "does the index exist".

## Two queries, same results

`NeuronInputField` builds one of two Cypher queries for every autocomplete
request:

- **`buildSlowQuery`** — `MATCH (n:Neuron)` and a `CONTAINS` test against
  eleven properties. Works on any server. Scans the whole `:Neuron` label.
- **`buildFastQuery`** — finds candidates through a fulltext index
  (`find_neurons_fulltext_properties_index`) and then ranks them on the same
  eleven properties.

They are meant to return identical rows. `checkFulltextSupport()` runs once per
dataset on mount, and again whenever the dataset changes, and sets
`useFastQuery` only when the server can serve the fast one correctly. Any
failure leaves `useFastQuery` false, which is the safe direction: the slow
query needs nothing from the server and returns the complete result set.

## What the fast path requires

Three things, each checked:

| requirement | why | how |
|---|---|---|
| Neo4j **4.4 or later** | `buildFastQuery` wraps its search in a `CALL {}` subquery, which 3.5 cannot parse | `dbms.components()`, kernel row, `parseFloat(version) < 4.4` |
| the fulltext index **exists and is ONLINE** | `db.index.fulltext.queryNodes` throws `IllegalArgumentException` on an unknown index; a `POPULATING` index answers with partial results | `SHOW INDEXES ... RETURN state` |
| the index **covers all eleven** searched properties | the index is how the query finds candidates at all, so an unindexed property makes matches invisible | `SHOW INDEXES ... RETURN properties`, compared against `SEARCH_PROPERTIES` |

The third is the subtle one, and it is why this file exists.

## Why coverage matters, measured

`buildFastQuery` finds candidates **only** through the index, then ranks them.
A neuron whose sole match is in a property the index does not cover is never a
candidate — it cannot be ranked, so it never appears. No error is raised
anywhere; the search just returns fewer rows.

Measured against `flywire-fafb:v783b` on `neuprint-test.janelia.org`, whose
index is `ONLINE` but covers only `type`, `instance` and `synonyms`:

| search term | fast query | slow query | rows lost | % missing |
|---|---|---|---|---|
| `lc` | 4,391 | 4,397 | 6 | 0.1% |
| `dn` | 1,343 | 1,369 | 26 | 1.9% |
| `l1` | 2,347 | 2,453 | 106 | 4.3% |
| `ps` | 1,044 | 1,334 | 290 | 21.7% |
| `a` | 22,371 | 53,226 | **30,855** | **58.0%** |
| `cb` | 12,551 | 12,551 | 0 | 0.0% |

Every difference is in one direction — rows present in the slow result and
absent from the fast one. Nothing extra ever appears. The size of the loss
depends entirely on how often the term occurs in the eight uncovered
properties, so a dataset can look fine on one search and lose most of its
results on the next. `flywireType` is among the uncovered properties here,
on a flywire dataset.

`flyem-snapshot`'s index builder has emitted all eleven properties since commit
`644158a`. Datasets ingested before that carry a three-property index.

### This is already happening in production

The client deployed on `neuprint.janelia.org` enables the fast path whenever
the index *name* exists -- it checks neither `ONLINE` nor coverage. Measured
coverage of every indexed dataset across the four production servers:

| server | dataset | index | covered |
|---|---|---|---|
| `neuprint` | `male-cns:v1.0` | ONLINE | **11/11** |
| `neuprint-yakuba` | `yakuba-vnc` | ONLINE | 3/11 |
| `neuprint-fish2` | `fish2` | ONLINE | 3/11 |
| `neuprint-fish2` | `fish2:v0.6` | ONLINE | 3/11 |

Every other dataset on those four servers has no fulltext index at all, or is
served from Neo4j 3.5, and so is on the slow query already -- correct results,
no fast path. `neuprint-pre` has no indexed dataset. Only the four above can
take the fast path, so the table is the whole exposure.

The three-property ones are all missing the same eight: `hemibrainType`,
`flywireType`, `systematicType`, `itoleeHl`, `trumanHl`, `class`,
`entryNerve`, `exitNerve`.

### The gap is not the damage

An incomplete index only loses rows where the uncovered properties are
actually populated. Two datasets with the identical 3/11 gap, same queries,
same day:

| term | yakuba-vnc fast / slow | lost | fish2 fast / slow | lost |
|---|---|---|---|---|
| `a` | 5,983 / 9,541 | **37.3%** | 4,288 / 4,288 | 0% |
| `dn` | 1,260 / 1,260 | 0% | 2 / 2 | 0% |
| `ps` | 6 / 6 | 0% | 22 / 22 | 0% |
| `lc` | 0 / 0 | 0% | 235 / 235 | 0% |

Yakuba loses over a third of its results for a broad term; fish2 loses
nothing. The difference is annotation, not indexing: when the index builder
was fixed in `flyem-snapshot`, `class` was measured at 24% populated on
yakuba and under 1% on fish2. That also matches the 42% figure taken
independently at the time.

### Reproducing it in the browser

On `https://neuprint-yakuba.janelia.org/`, search for **`ascending neuron`**.

The dropdown offers nothing, although two neurons in `yakuba-vnc` carry
exactly that value in `class`. The suggestion list is grouped by field --
`Types`, `Instances`, `Classes`, `Body IDs` and so on -- and the `Classes`
group simply never appears, because `class` is not in the index and the fast
query therefore never retrieves those neurons as candidates.

To confirm the neurons are present and only the search is at fault, type one
of their body IDs. That path uses `OPTIONAL MATCH (b:Neuron) WHERE
b.bodyId = user_body`, which does not touch the index, so the neuron appears
under `Body IDs`. Note the dropdown shows `instance || type` as the secondary
text for a body ID, so it will not display the `class` value itself.

Either remedy fixes this symptom: rebuilding the index lets the fast query
find them, and the coverage check falls back to the slow query, whose
`CONTAINS` test covers `class` directly. The rebuild is the better outcome
because it keeps the search fast as well as correct.

Counting suggestions is not a usable test, by the way: neither query has a
`LIMIT`, so a broad term returns thousands of rows into a scrollable list and
the difference between 5,983 and 9,541 is invisible. A missing group heading
is observable; a missing row among thousands is not.

Two things follow, and the second is the reason to fix this rather than wait:

- **It hides.** Only a broad term exposes it, so a search looks correct until
  someone types a common letter. `lc` on yakuba returns nothing at all from
  either query, `dn` and `ps` agree exactly, and `a` drops 3,558 rows.
- **A clean dataset today is a dormant failure, not an absent one.** fish2's
  eight uncovered properties are simply empty right now, and fish2 is under
  active annotation. Whenever someone begins filling in `class`, search starts
  dropping those neurons silently -- no deploy, no error, nothing to correlate
  the regression against. Yakuba is what that looks like after it happens.

`male-cns:v1.0` is 11/11 and was verified to return identical rows from both
queries, so `neuprint.janelia.org` itself is unaffected.

### How bad is this really, and is class search even wanted?

Two objections are worth stating, because they narrow the claim.

**The input does not advertise these fields.** Its label reads *"Neuron
Instance, Type or BodyId (optional)"*, which promises three fields, not
eleven. If users are not told they can search by class, few will be relying
on it, and "yakuba users are losing search results" overstates the case. It
is a capability that quietly does not work, not a stream of failed searches.

**But the extra fields are deliberate, and the label is simply stale.**
`a2edf26` (April 2026) is titled "expand search fields" and added twelve
grouped sections to the dropdown -- `Classes`, `Entry Nerves`, `Exit Nerves`,
`Hemibrain Types`, `Ito-Lee Hemilineage` and the rest. The label was last
touched in Oct 2024 and Aug 2025, well before that.

**The defect that survives both objections is inconsistency.** The same
search returns different answers on different datasets, in the same UI, from
the same build, with nothing on screen to explain why:

| dataset | index | query used | searching "ascending" |
|---|---|---|---|
| `manc:v1.2.3` | none | slow | finds **2,406** neurons via `class` |
| `yakuba-vnc` | 3/11 | fast | finds **none** via `class` |

manc carries 1,862 neurons classed `ascending neuron` and 13,066
`intrinsic neuron`; searching those works there and silently does not on
yakuba. Whatever the intended contract, one dataset honoring it and another
not is a bug.

That leaves a product question this repository cannot answer on its own:
**should the search cover class, nerve and hemilineage at all?**

- If yes, the fix is to index all eleven everywhere -- `flyem-snapshot`'s
  `644158a` -- and to correct the label so it says what the field does.
- If no, the honest fix is the opposite: narrow both queries to
  instance/type/bodyId and drop the extra dropdown groups. That would also
  make every dataset consistent, and make both queries cheaper.

The coverage check is worth having either way: it only ensures the fast
and slow queries agree, whatever set of fields they end up searching.

### The faster remedy

Tightening the client makes results correct by falling back to the slow query.
Rebuilding the index makes them correct *and* fast, and needs no frontend
release:

```cypher
DROP INDEX find_neurons_fulltext_properties_index;

CREATE FULLTEXT INDEX find_neurons_fulltext_properties_index
FOR (n:`<dataset>_Neuron`)
ON EACH [n.`type`, n.`instance`, n.`hemibrainType`, n.`flywireType`,
         n.`systematicType`, n.`itoleeHl`, n.`trumanHl`, n.`synonyms`,
         n.`class`, n.`entryNerve`, n.`exitNerve`];
```

The label must match the existing index's `labelsOrTypes`, and the rebuild runs
in the background -- the index reports `POPULATING` until it finishes. A client
that requires `ONLINE`, as the amended check does, falls back to the slow query
meanwhile, which is the correct behaviour. Re-ingesting the dataset with a
current `flyem-snapshot` achieves the same thing.

## Fleet state

Every dataset on `neuprint-test.janelia.org`, with the decision the check
reaches:

| dataset | Neo4j | index | covered | decision |
|---|---|---|---|---|
| `male-cns:v1.0` | 4.4.16 | ONLINE | 11/11 | **fast** |
| `flywire-fafb:v783b` | 4.4.16 | ONLINE | 3/11 | slow — incomplete index |
| `male-cns:v0.9` | 4.4.16 | missing | — | slow |
| `manc:v1.0`, `manc:v1.2.1`, `manc:v1.2.3` | 4.4.16 | missing | — | slow |
| `optic-lobe:v1.0.1`, `optic-lobe:v1.1` | 4.4.16 | missing | — | slow |
| `hemibrain:v1.2.1`, `mushroombody` | 3.5.3 | n/a | — | slow — below the 4.4 gate |

So the fast path currently reaches one dataset of ten. That is not a
regression: those datasets were already being served by the slow query, which
returns correct results. The fast path becomes available to each of them when
it is next re-ingested with a pipeline that builds the full index.

On `male-cns:v1.0`, where the index is complete, the two queries were compared
directly and returned the same 5,138 rows.

## Server compatibility

`SHOW INDEXES YIELD name, state, properties` was verified against
**4.4.16** (every current production backend) and **2026.08.1** (the CalVer
release `flyem-snapshot` is moving to), with both a complete and a
three-property index. Both return the same shape — a plain list of property
name strings — so the comparison behaves identically.

3.5.3 never reaches that query: the version gate returns first. This was
confirmed against two live 3.5.3 datasets, which report `3.5.3` and fall to
the slow path.

Two implementation notes:

- The property comparison happens in JavaScript, not Cypher. `UNWIND` is not
  accepted after `SHOW INDEXES` on every supported version, whereas
  `YIELD ... WHERE ... RETURN` is.
- `dbms.components()` is read with an explicit `WHERE name = 'Neo4j Kernel'`.
  On the CalVer line it returns a second row for Cypher itself
  (`versions: ["5", "25"]`), so taking row zero blindly depends on row order.

## Verifying a change here

The capability queries and both search queries can be pulled straight out of
the source and run against a live server, which is how the tables above were
produced — that way what gets tested is what the component actually sends,
rather than a paraphrase of it. The useful checks:

1. For each dataset: version, index state, indexed properties, and the
   resulting `useFastQuery` decision.
2. For any dataset where the decision is *fast*: run both queries with the
   same term and compare the full row sets, not just the counts. They must be
   identical.
3. Dataset switching cannot be checked through the API. In the browser, start
   a search on a dataset that uses the fast path, switch to one that does not
   without reloading, and confirm suggestions still appear. `useFastQuery` is
   reset on a dataset change precisely because a stale `true` makes
   `queryNodes` throw, and `fetchOptions` turns that into an empty list.

## A known duplication

`SEARCH_PROPERTIES` lists the eleven properties for the coverage check, and the
same eleven appear inside `buildFastQuery` and `buildSlowQuery` as Cypher
fragments. They have to agree.

The lists were deliberately not consolidated: the query text has been verified
equivalent against production data across many datasets and millions of rows,
and regenerating it from an array to save one duplication risks changing it by
accident. If a twelfth searchable property is ever added, it has to be added in
three places — and to `flyem-snapshot`'s `indexes.py`, which builds the index.
