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

| server | dataset | index | covered | served vs complete, term `a` |
|---|---|---|---|---|
| `neuprint` | `banc:v888` | ONLINE | 3/11 | 29,131 / 87,189 -- **66.6% lost** |
| `neuprint` | `male-cns:v1.0` | ONLINE | **11/11** | 67,449 / 67,449 -- none lost |
| `neuprint-yakuba` | `yakuba-vnc` | ONLINE | 3/11 | 6,002 / 9,564 -- **37.2% lost**; term `e` loses **98.5%** |
| `neuprint-fish2` | `fish2` | ONLINE | 3/11 | 4,288 / 4,288 -- none lost |
| `neuprint-fish2` | `fish2:v0.7` | ONLINE | 3/11 | 4,077 / 4,077 -- none lost |

Every dataset on all four servers was enumerated with a token and probed, so
this is the complete exposure: five indexed datasets, four of them 3/11, two
of those currently losing rows. `neuprint-pre` has no fulltext index on
either of its datasets. Everything not listed has no index or is served from
Neo4j 3.5, so it is already on the slow query -- correct results, no fast
path.

`banc:v888` is the largest loss for term `a`, and it is on the primary
production server -- worse there than `flywire-fafb:v783b`'s 58% on the test
server. Ranking datasets against each other only makes sense per term,
though: `yakuba-vnc` loses 37% on `a` but 98.5% on `e`, for reasons covered
under *The gap is not the damage* below.

Two notes on reading these numbers. They drift: yakuba measured
5,983 / 9,541 one day and 6,002 / 9,564 the next, because it is under active
annotation. And the fish2 snapshot rolls -- `fish2:v0.6` became `fish2:v0.7`
within a week, and the new one was built with the same 3/11 index, which
confirms the incomplete index comes from the ingestion pipeline rather than
from a one-off.

The four three-property indexes are all missing the same eight:
`hemibrainType`, `flywireType`, `systematicType`, `itoleeHl`, `trumanHl`,
`class`, `entryNerve`, `exitNerve`.

**Audit these servers authenticated.** `/api/dbmeta/datasets` returns a
different set depending on the token: an unauthenticated client sees nine
datasets on `neuprint.janelia.org`, a token holder sees ten. `banc:v888` --
the single worst case here -- is one of the hidden ones, and an earlier
unauthenticated pass concluded the whole server was unaffected because of it.
A clean result from an anonymous audit means nothing.

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

So the gap sets the ceiling and annotation decides how much of it is
realised. `banc:v888` shows the ceiling is high: same 3/11 gap, and it loses
66.6% because its uncovered properties are heavily populated. fish2 is the
same gap with the loss not yet realised.

**And the search term moves it enormously.** On `yakuba-vnc`:

| term | fast | slow | lost | % missing |
|---|---|---|---|---|
| `lc` | 0 | 0 | 0 | 0% |
| `ps` | 6 | 6 | 0 | 0% |
| `dn` | 1,260 | 1,260 | 0 | 0% |
| `a` | 6,002 | 9,565 | 3,563 | 37.3% |
| `e` | **318** | **21,183** | **20,865** | **98.5%** |

`e` is close to a worst case, and the reason is structural rather than
accidental: `class` on a VNC dataset is a controlled vocabulary in which
every value contains an `e` -- `intrinsic neuron`, `sensory neuron`,
`ascending neuron`, `descending neuron`, `motor neuron`. Searching `e`
therefore matches almost everything through `class`, which is exactly the
property the index does not cover.

The same shape is visible on `manc:v1.2.3`, where 18,750 of the 23,658
neurons matching `e` are reachable *only* through `class`. manc has no
fulltext index, so it is on the slow query and unaffected -- but it shows
that a dataset acquiring a three-property index would immediately lose
around 79% of that search.

So "37% lost" understates it. For the wrong term the fast query returns
almost nothing, and which terms those are depends on the dataset's
annotation vocabulary rather than on anything a user could anticipate.

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
queries, so a complete index does behave correctly under the fast path. It is
not representative of its server, though: `banc:v888` sits alongside it on
`neuprint.janelia.org` with a 3/11 index and loses two thirds of its results.

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

#### Four different answers to "what is searchable"

The question is sharper than it first looks, because the eleven searched
properties are hardcoded while a dataset's own annotation vocabulary is not.
Four parts of the UI disagree:

| where | what it says is searchable |
|---|---|
| the input's label | "Neuron Instance, Type or BodyId" -- three fields |
| `buildSlowQuery` / `buildFastQuery` | eleven hardcoded properties |
| the dropdown's groups | twelve sections, including `Classes` |
| the results columns | per dataset, from `neuronColumns` in `Meta` |

Only the last is dataset-aware. `FindNeurons` reads its columns from
`neuronColumns` / `neuronColumnsOrdered`, so each dataset declares its own.

`banc:v888` shows what that costs. Its declared columns are `superclass`,
`cellClass` and `subclass` -- none of which appears anywhere in this
codebase, and none of which either query searches. Meanwhile it *does* carry
a populated `class` (body 720575941415606556 has
`class = 'abdomen_motor_neuron'`, `type = 'EFFabg07'`), which the queries do
search but which the UI cannot display, because `class` is not among that
dataset's declared columns.

So on banc:

- the fields curators actually use are **unsearchable**, by either query,
  index or no index
- the field that *is* searched is **invisible** in the results table
- and until this branch, searching it returned incomplete results anyway

That third point is what the coverage check fixes. The first two are
untouched by it, are not index problems, and are worth raising separately:
a hardcoded search list cannot keep up with per-dataset vocabularies. Whether
`class` is legacy and `cellClass` superseded it on banc is worth
establishing before deciding anything.

To inspect this for a dataset, the Custom Cypher plugin will show both
vocabularies side by side:

```cypher
MATCH (n:Neuron) WHERE n.bodyId = 720575941415606556
RETURN n.bodyId, n.type, n.class, n.cellClass, n.superclass, n.subclass
```

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
3. Dataset switching cannot be checked through the API; it needs a browser.
   Switch datasets without reloading and confirm the search still behaves.

   **Pick the target dataset carefully.** "Confirm suggestions still appear"
   is only a valid test when the new dataset has *no* index, because that is
   what makes a stale `useFastQuery: true` throw
   `IllegalArgumentException` and leaves the dropdown empty. Switch to a
   dataset that *has* an incomplete index and a stale flag does not throw at
   all -- the fast query runs and simply returns less, so the dropdown looks
   fine. The discriminator there is which groups appear, not whether any do.

### Verified in the browser

Run against `neuprint-test.janelia.org` with this branch deployed,
2026-09-23:

| check | dataset | result |
|---|---|---|
| coverage check falls back | `flywire-fafb:v783b` (3/11) | searching `visual` offers a `Classes` group -- previously nothing from `class` |
| fast path still used | `male-cns:v1.0` (11/11) | searching `DN` returns suggestions as before |
| flag re-evaluated on switch | `male-cns:v1.0` -> `flywire-fafb:v783b`, no reload | `Classes` group appears, so the flag was re-checked rather than carried over |

The third is the first time the `componentDidUpdate` reset added in `5571890`
has actually been exercised; it shipped in PR #383 untested, because the API
cannot reach it. It used the positive discriminator described above rather
than an empty-dropdown test, for the reason given there.

`visual` was chosen because 11,386 neurons on `flywire-fafb:v783b` carry it in
`class` and it appears in no `type`, `instance` or `synonyms`, so only a
`class` search can find them. `DN` matches on all three datasets, so a switch
cannot come up empty merely because the term does not apply.

### Before and after, on the production server

The controlled comparison: same server, same term, same datasets, with only
the client differing. The capability queries were extracted from `master` and
from this branch in turn and each replayed against
`neuprint.janelia.org`.

| client | `banc:v888` | served | complete | lost |
|---|---|---|---|---|
| `master` (state and name only) | fast | 29,131 | 87,189 | **58,058 -- 66.6%** |
| this branch (state and coverage) | slow | 87,189 | 87,189 | **0** |

**58,058 search results restored on the primary production server.** And
`male-cns:v1.0` stays on the fast path in both runs, so the check is not
bluntly switching the optimisation off -- it withdraws it exactly where the
index cannot support it. Every other dataset on that server was already on
the slow query and is unchanged.

Note what the first row means: **merging PR #383 would not have fixed this.**
That row *is* current `master`, with #383 in it. `banc:v888`'s index is
`ONLINE`, merely incomplete, so a state-only check passes it straight through
to the fast query. Coverage is the part that matters.

The cost is visible in the same table. `banc:v888` now falls back to scanning
for 87,189 matches on every keystroke. Correct but slower is the intended
trade; the way to get correct *and* fast is a complete index, which is
`flyem-snapshot`'s `644158a`.

### Nothing is lost any more, measured

The table under *Why coverage matters* compares the two **queries**, and those
numbers are unchanged by this branch: `flywire-fafb:v783b` still has a 3/11
index, so its fast query still loses 58%. What changed is which query runs.

So the useful measure is what a user now actually receives versus the complete
result set. For every dataset on `neuprint-test.janelia.org`, the query the
client would choose was run and compared against `buildSlowQuery` as ground
truth. Term `a`, the worst case from the earlier table:

| dataset | query used | rows served | complete | lost |
|---|---|---|---|---|
| `flywire-fafb:v783b` | slow | 53,226 | 53,226 | **0** |
| `hemibrain:v1.2.1` | slow | 9,058 | 9,058 | **0** |
| `male-cns:v0.9` | slow | 67,411 | 67,411 | **0** |
| `male-cns:v1.0` | **fast** | 67,449 | 67,449 | **0** |
| `manc:v1.0` | slow | 15,474 | 15,474 | **0** |
| `manc:v1.2.1` | slow | 16,457 | 16,457 | **0** |
| `manc:v1.2.3` | slow | 16,459 | 16,459 | **0** |
| `mushroombody` | slow | 302 | 302 | **0** |
| `optic-lobe:v1.0.1` | slow | 7,294 | 7,294 | **0** |
| `optic-lobe:v1.1` | slow | 7,946 | 7,946 | **0** |

`flywire-fafb:v783b` is the row that matters: 53,226 of 53,226 where the fast
query would have returned 22,371. `male-cns:v1.0` is the other one -- it still
takes the fast path, and still returns the complete set, so the check is not
merely disabling the optimisation everywhere.

The same performance caveat applies as on `banc:v888` above:
`flywire-fafb:v783b` now scans all 167,914 neurons with eleven `CONTAINS`
tests per row on every keystroke.

## A known duplication

`SEARCH_PROPERTIES` lists the eleven properties for the coverage check, and the
same eleven appear inside `buildFastQuery` and `buildSlowQuery` as Cypher
fragments. They have to agree.

The lists were deliberately not consolidated: the query text has been verified
equivalent against production data across many datasets and millions of rows,
and regenerating it from an array to save one duplication risks changing it by
accident. If a twelfth searchable property is ever added, it has to be added in
three places — and to `flyem-snapshot`'s `indexes.py`, which builds the index.
