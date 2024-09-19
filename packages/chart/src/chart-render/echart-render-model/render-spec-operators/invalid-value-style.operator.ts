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

import { defaultChartStyle } from '../../../chart/constants/default-chart-style';
import { InvalidValueType } from '../../../chart/style.types';
import type { EChartRenderSpecOperator } from '../echart-render-engine';
import { seriesForEach } from './tools';

export const invalidValueStyleOperator: EChartRenderSpecOperator = (spec, style, config, instance) => {
    const invalidValueType = style.invalidValueType ?? defaultChartStyle.invalidValueType;
    seriesForEach(spec.series, (series) => {
        const isLine = series.type === 'line';
        if (!isLine) {
            return;
        }
        if (!series.rawData) {
            series.rawData = (series.data as number[])?.slice();
        }

        switch (invalidValueType) {
            case InvalidValueType.Zero: {
                series.data = series.rawData.map((value) => {
                    if (value === null || value === undefined) {
                        return 0;
                    }
                    return value;
                });
                break;
            }
            case InvalidValueType.Link: {
                series.data = series.rawData.slice();
                series.connectNulls = true;
                break;
            }
            case InvalidValueType.Break: {
                series.data = series.rawData.slice();
                break;
            }
        }
    });
};
