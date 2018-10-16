/*
 * Find neurons similar to a provided neuron.
*/

import SimpleCellWrapper from '../helpers/SimpleCellWrapper'
import React from 'react'
import colormap from 'colormap'
import ClickableQuery from '../components/ClickableQuery.react';

let viridisColorMap = colormap({
    colormap: 'viridis',
    nshades: 101,
    format: 'hex',
    alpha: 1

})

const colorArray = [
    "#4e79a7", "#f28e2b", "#e15759",
    "#76b7b2", "#59a14f", "#edc948",
    "#b07aa1", "#9c755f", "#bab0ac"
]
let usedColorIndex = 0
let roiToColorMap = {}
var processResults = function (results, state) {

    let index = 0
    let tables = []

    function ColorLegend(props) {

        return viridisColorMap.map((color, index) => {
            const styles = {
                margin: '0px',
                width: '2px',
                height: '10px',
                backgroundColor: color,
                overflow: 'visible',
                display: 'inline-flex',
                flexDirection: 'row',
            }
            return <div key={index} style={styles} ></div>
        })
    }

    let headerdata = [
        new SimpleCellWrapper(index++, "bodyId"),
        new SimpleCellWrapper(index++, "name"),
        new SimpleCellWrapper(index++, "status"),
        new SimpleCellWrapper(index++, "pre"),
        new SimpleCellWrapper(index++, "post"),
        new SimpleCellWrapper(index++, ["roi heatmap   0%", ColorLegend(), "100%   (mouseover for details) "]),
        new SimpleCellWrapper(index++, "roi breakdown (mouseover for details)")
    ]

    let data = []
    const clusterName = results.records.data[0][7]
    let table = {
        header: headerdata,
        body: data,
        name: "Neurons similar to " + state.bodyId + " with classification " + clusterName,
        sortIndices: new Set([0, 1, 2, 3, 4]),
    }

    function ColorBox(props) {
        const styles = {
            margin: '0px',
            width: props.percentWidth + 'px',
            height: '20px',
            backgroundColor: props.color,
            overflow: 'visible',
            display: 'inline-flex',
            flexDirection: 'row',
        }
        return <div key={props.roiName} style={styles} title={props.roiName + " " + Math.round(props.percent * 100) / 100 + "%"}></div>
    }

    function HeatMap(props) {
        const type = props.type
        const total = Math.max(props.total, 0.01)

        return props.roiList.map((roi) => {
            return <ColorBox
                key={roi}
                roiName={roi}
                color={props.roiInfoObject[roi] ? viridisColorMap[Math.floor(props.roiInfoObject[roi][type] * 1.0 / total * 100)] : viridisColorMap[0]}
                percentWidth="10"
                percent={props.roiInfoObject[roi] ? props.roiInfoObject[roi][type] * 1.0 / total * 100 : 0}
            />
        })
    }

    function HeatMapLabels(props) {
        const styles = {
            margin: '0px',
            width: '10px',
            height: '40px',
            overflow: 'visible',
            display: 'inline-flex',
            flexDirection: 'row',
            whiteSpace: "nowrap",
            transform: "rotate(-90deg) translateX(-40px)",
            transformOrigin: "left top 0",
            fontSize: "10px"
        }
        return props.roiList.map((roi) => {
            return <div title={roi} style={styles} key={roi}>{roi}</div>
        })
    }

    function BarGraph(props) {
        const type = props.type
        const total = Math.max(props.total, 0.01)

        return Object.keys(props.roiInfoObject).map((roi) => {
            if (props.roiList.find((element) => { return element === roi })) {
                let color
                if (roiToColorMap[roi]) {
                    color = roiToColorMap[roi]
                } else {
                    roiToColorMap[roi] = colorArray[usedColorIndex]
                    color = colorArray[usedColorIndex]
                    if (usedColorIndex < colorArray.length - 1) {
                        usedColorIndex++
                    } else {
                        usedColorIndex = 0
                    }
                }
                const percent = props.roiInfoObject[roi][type] * 1.0 / total
                return <ColorBox
                    key={roi}
                    roiName={roi}
                    color={color}
                    percentWidth={percent * 400}
                    percent={percent * 100}
                />
            }
        })
    }

    results.records.data.forEach(function (record) {
        const bodyId = record[0]
        const name = record[1]
        const status = record[2]
        // const pre = record[3]
        // const post = record[4]
        const roiInfo = record[5]
        const roiInfoObject = JSON.parse(roiInfo)
        const roiList = record[6]

        const styles = {
            display: 'flex',
            flexDirection: 'row',
            margin: '5px'
        }

        let pre = 0
        let post = 0
        Object.keys(roiInfoObject).map((roi) => {
            if (roiList.find((element) => { return element === roi })) {
                pre += roiInfoObject[roi]["pre"]
                post += roiInfoObject[roi]["post"]
            }
        })

        let text = <div style={styles}><HeatMapLabels roiList={roiList} /></div>
        let hmPost = <div style={styles}><HeatMap roiList={roiList} roiInfoObject={roiInfoObject} type={"post"} total={post} />inputs</div>
        let hmPre = <div style={styles}><HeatMap roiList={roiList} roiInfoObject={roiInfoObject} type={"pre"} total={pre} />outputs</div>
        const inputBar = <div style={styles}><BarGraph roiInfoObject={roiInfoObject} roiList={roiList} type={"post"} total={post} />inputs</div>
        const outputBar = <div style={styles}><BarGraph roiInfoObject={roiInfoObject} roiList={roiList} type={"pre"} total={pre} />outputs</div>

        data.push([
            new SimpleCellWrapper(index++, JSON.stringify(bodyId)),
            new SimpleCellWrapper(index++, JSON.stringify(name)),
            new SimpleCellWrapper(index++, JSON.stringify(status)),
            new SimpleCellWrapper(index++, JSON.stringify(pre)),
            new SimpleCellWrapper(index++, JSON.stringify(post)),
            // new SimpleCellWrapper(index++, JSON.stringify(roiInfo)),
            new SimpleCellWrapper(index++, [text, hmPost, hmPre]),
            new SimpleCellWrapper(index++, [inputBar, outputBar]),
        ])
    })

    tables.push(table);
    return tables
}

const processGroupResults = function (results, state) {

    let index = 0
    let tables = []

    let headerdata = [
        new SimpleCellWrapper(index++, "clusterName"),
    ]

    let data = []
    let table = {
        header: headerdata,
        body: data,
        name: "Cluster names for neurons.",
        sortIndices: new Set([0, 1]),
    }

    results.records.data.forEach(function (record) {
        let clusterName = record[0]
        let clusterQuery = "MATCH (n:`XX-Neuron`{clusterName:\"ZZ\"}) RETURN n.bodyId"
        clusterQuery = clusterQuery.replace(/XX/g, state.dataset)
        clusterQuery = clusterQuery.replace(/ZZ/g, clusterName)
        let neoCluster = {
            queryStr: clusterQuery,
            callback: processCluster,
            isChild: true,
            state: {
                clusterName: clusterName
            }
        }

        data.push([
            new SimpleCellWrapper(index++,
                (<ClickableQuery neoQueryObj={neoCluster}>
                    {clusterName}
                </ClickableQuery>)
            )
        ])
    })

    tables.push(table);
    return tables
}

const processCluster = function (results, state) {

    let index = 0
    let tables = []

    let headerdata = [
        new SimpleCellWrapper(index++, "bodyId"),
    ]

    let data = []
    let table = {
        header: headerdata,
        body: data,
        name: "Neurons with classification " + state.clusterName,
        sortIndices: new Set([0]),
    }

    results.records.data.forEach(function (record) {
        let bodyId = record[0]

        data.push([
            new SimpleCellWrapper(index++, JSON.stringify(bodyId))
        ])
    })

    tables.push(table);
    return tables

}

export default function (datasetstr, bodyId, getGroups, limitBig, statusFilters) {

    let query
    if (!getGroups) {
        let similarQuery = "MATCH (m:Meta{dataset:'XX'}) WITH m.superLevelRois AS rois MATCH (n:`XX-Neuron`{bodyId:ZZ}) WITH n.clusterName AS cn, rois MATCH (n:`XX-Neuron`{clusterName:cn}) RETURN n.bodyId, n.name, n.status, n.pre, n.post, n.roiInfo, rois, n.clusterName"
        similarQuery = similarQuery.replace(/XX/g, datasetstr)
        similarQuery = similarQuery.replace(/ZZ/g, bodyId)
        // let params = {
        //     dataset: datasetstr,
        //     statuses: statusFilters
        // };
        // if (limitBig === "true") {
        //     params["pre_threshold"] = 2;
        // }

        query = {
            queryStr: similarQuery,
            // params: params,
            callback: processResults,
            state: {
                bodyId: bodyId,
            },
        }
    } else {
        let groupsQuery = "MATCH (n:`XX-Neuron`) RETURN DISTINCT n.clusterName"
        groupsQuery = groupsQuery.replace(/XX/g, datasetstr)

        query = {
            queryStr: groupsQuery,
            // params: params,
            callback: processGroupResults,
            state: {
                dataset: datasetstr
            },
        }
    }

    return query
}