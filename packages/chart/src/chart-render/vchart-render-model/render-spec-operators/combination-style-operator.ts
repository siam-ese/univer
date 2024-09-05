/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICommonChartSpec, IDataValues } from '@visactor/vchart';
import { chartBitsUtils, ChartTypeBits } from '../../../chart/constants';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import type { ChartDataSourceValue } from '../../../chart/types';
import { SpecField } from '../converters/constants';
import type { VChartRenderSpecOperator } from '../vchart-render-engine';

interface ICombinationDataValue {
    __seriesIndex__: number;
    __seriesField__: string;
    __yField__: ChartDataSourceValue;
    __xField__: string | number;
    __seriesFieldLabel__: string;
}

export const combinationStyleOperator: VChartRenderSpecOperator = (_spec, style, config, instance) => {
    if (config.type !== ChartTypeBits.Combination) return _spec;
    const spec = _spec as ICommonChartSpec;
    const values = (spec.data as IDataValues)?.values as Array<ICombinationDataValue>;

    const chartTypeBitSet = new Set<string>();

    const chartData = [
        { id: String(ChartTypeBits.Column), values: [] },
        { id: String(ChartTypeBits.Line), values: [] },
        { id: String(ChartTypeBits.Area), values: [] },
    ];

    const combinationChartTypeMap = style.common?.seriesStyleMap;
    values.forEach((value) => {
        const fallbackChartType = value[SpecField.seriesIndex] === 0 ? defaultChartStyle.combination.firstChartType : defaultChartStyle.combination.otherChartType;
        const seriesStyleItem = combinationChartTypeMap?.[value[SpecField.seriesField]];
        const chartTypeBitStr = String(seriesStyleItem?.chartType ?? fallbackChartType);
        const dataItem = chartData.find((item) => item.id === chartTypeBitStr);

        (dataItem?.values as ICombinationDataValue[]).push(value);
        if (!chartTypeBitSet.has(chartTypeBitStr)) {
            chartTypeBitSet.add(chartTypeBitStr);
        }
    });

    const filteredChartData = chartData.filter((item) => chartTypeBitSet.has(item.id));
    spec.data = filteredChartData;
    spec.series = filteredChartData.map((item, index) => {
        const chartTypeStr = chartBitsUtils.chartBitToString(Number(item.id)) as 'bar' | 'line' | 'area';
        return {
            type: chartTypeStr,
            id: item.id,
            dataIndex: index,
            xField: chartTypeStr === 'bar' ? [SpecField.xField, SpecField.seriesField] : SpecField.xField,
            yField: SpecField.yField,
            seriesField: SpecField.seriesFieldLabel,
        };
    });

    return spec;
};
