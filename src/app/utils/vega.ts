// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import {
    AttributeMap,
    Chart,
    ChartState,
    ObjectProperties
} from '../../core/specification';
import { Dataset } from '../../core/dataset';
import * as Vega from 'vega-typings';

export function createVegaSpec(chart: Chart<ObjectProperties>, chartState: ChartState<AttributeMap>, dataset: Dataset) {
    const spec: Vega.Spec = {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        data: dataset.tables.map(t => {
            const d: Vega.Data = {
                name: t.name,
                values: t.rows
            };
            return d;
        })
    };
    return spec;
}
