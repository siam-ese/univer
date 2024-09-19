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

import type { IChartRenderSpecConverter } from '../../types';
import { chartBitsUtils, ChartTypeBits } from '../../../chart/constants';
import type { EChartSpec } from '../echart-render-engine';

export const pieChartConverter: IChartRenderSpecConverter<EChartSpec> = {
    canConvert(config) {
        return chartBitsUtils.baseOn(config.type, ChartTypeBits.Pie);
    },

    convert(config): EChartSpec {
        const { category, series } = config;

        // const { categoryNameMap } = createLabelMap(config);
        const values = series[0]?.items.map((item, valueIndex) => {
            return {
                name: category?.items[valueIndex].label,
                value: item.value as number,
            };
        });

        return {
            // backgroundColor: '#fff',
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c}({d}%)',
            },
            series: [
                {
                    name: 'data',
                    type: 'pie',
                    data: values,
                    radius: '55%',
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1.5,
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                },
            ],
        };
    },
};
