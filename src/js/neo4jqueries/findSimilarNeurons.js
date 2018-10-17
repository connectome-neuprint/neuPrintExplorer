/*
 * Find neurons similar to a provided neuron.
*/

import SimpleCellWrapper from '../helpers/SimpleCellWrapper'
import React from 'react'
import ClickableQuery from '../components/ClickableQuery.react'
import RoiHeatMap, { ColorLegend } from '../components/visualization/MiniRoiHeatMap.react'
import RoiBarGraph from '../components/visualization/MiniRoiBarGraph.react';

const processResults = function (results, state) {

    let index = 0
    const tables = []

    const headerdata = [
        new SimpleCellWrapper(index++, "bodyId"),
        new SimpleCellWrapper(index++, "name"),
        new SimpleCellWrapper(index++, "status"),
        new SimpleCellWrapper(index++, "#pre (#no ROI)"),
        new SimpleCellWrapper(index++, "#post (#no ROI)"),
        new SimpleCellWrapper(index++, ["roi heatmap (mouseover for details)", ColorLegend()]),
        new SimpleCellWrapper(index++, "roi breakdown (mouseover for details)")
    ]

    const data = []
    const clusterName = results.records.data[0][7]
    const table = {
        header: headerdata,
        body: data,
        name: "Neurons similar to " + state.bodyId + " with classification " + clusterName,
        sortIndices: new Set([0, 1, 2, 3, 4]),
    }

    results.records.forEach(function (record) {
        const bodyId = record.get("n.bodyId")
        const name = record.get("n.name")
        const status = record.get("n.status")
        const pre = record.get("n.pre")
        const post = record.get("n.post")
        const roiInfo = record.get("n.roiInfo")
        const roiList = record.get("rois")

        const roiInfoObject = JSON.parse(roiInfo)
        let preTotal = 0
        let postTotal = 0
        Object.keys(roiInfoObject).map((roi) => {
            if (roiList.find((element) => { return element === roi })) {
                preTotal += roiInfoObject[roi]["pre"]
                postTotal += roiInfoObject[roi]["post"]
            }
        })

        data.push([
            new SimpleCellWrapper(index++, JSON.stringify(bodyId)),
            new SimpleCellWrapper(index++, name),
            new SimpleCellWrapper(index++, status),
            new SimpleCellWrapper(index++, JSON.stringify(pre) + " (" + JSON.stringify(pre - preTotal) + ")"),
            new SimpleCellWrapper(index++, JSON.stringify(post) + " (" + JSON.stringify(post - postTotal) + ")"),
            new SimpleCellWrapper(index++, <RoiHeatMap roiList={roiList} roiInfoObject={roiInfoObject} preTotal={preTotal} postTotal={postTotal} />),
            new SimpleCellWrapper(index++, <RoiBarGraph roiList={roiList} roiInfoObject={roiInfoObject} preTotal={preTotal} postTotal={postTotal} />),
        ])
    })

    tables.push(table);
    return tables
}

const processGroupResults = function (results, state) {

    let index = 0
    const tables = []

    const headerdata = [
        new SimpleCellWrapper(index++, "clusterName"),
    ]

    const data = []
    const table = {
        header: headerdata,
        body: data,
        name: "Cluster names for neurons.",
        sortIndices: new Set([0, 1]),
    }

    results.records.forEach(function (record) {
        const clusterName = record.get("n.clusterName")
        const clusterQuery = "MATCH (n:`" + state.dataset + "-Neuron`{clusterName:\"" + clusterName + "\"}) RETURN n.bodyId"

        const neoCluster = {
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
    const tables = []

    const headerdata = [
        new SimpleCellWrapper(index++, "bodyId"),
    ]

    const data = []
    const table = {
        header: headerdata,
        body: data,
        name: "Neurons with classification " + state.clusterName,
        sortIndices: new Set([0]),
    }

    results.records.forEach(function (record) {
        const bodyId = record.get("n.bodyId")

        data.push([
            new SimpleCellWrapper(index++, JSON.stringify(bodyId))
        ])
    })

    tables.push(table);
    return tables

}

export default function (dataset, bodyId, getGroups, limitBig, statusFilters) {

    let query
    if (!getGroups) {
        const similarQuery = "MATCH (m:Meta{dataset:'" + dataset + "'}) WITH m.superLevelRois AS rois MATCH (n:`" + dataset + "-Neuron`{bodyId:" + bodyId + "}) WITH n.clusterName AS cn, rois MATCH (n:`" + dataset + "-Neuron`{clusterName:cn}) RETURN n.bodyId, n.name, n.status, n.pre, n.post, n.roiInfo, rois, n.clusterName"
        // let params = {
        //     dataset: dataset,
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
        const groupsQuery = "MATCH (n:`" + dataset + "-Neuron`) RETURN DISTINCT n.clusterName"

        query = {
            queryStr: groupsQuery,
            // params: params,
            callback: processGroupResults,
            state: {
                dataset: dataset
            },
        }
    }

    return query
}