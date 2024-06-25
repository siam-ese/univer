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

import type { ICartesianChartSpec } from '@visactor/vchart';
import type { IChartRenderSpecConverter } from '../types';
import { SpecFields } from './constants';

export const lineConverter: IChartRenderSpecConverter<ICartesianChartSpec & { seriesField: string }> = {
    canConvert(config) {
        return true;
    },
    convert(config) {
        const unit = Array.isArray(config.units) ? config.units[0] : config.units;
        const { yAxes, xAxis } = unit.data;
        const values = yAxes.map((items) => {
            return items.values.map((value, valueIndex) => ({
                [SpecFields.yField]: value,
                [SpecFields.xField]: xAxis?.getValueByIndex(valueIndex),
                [SpecFields.seriesField]: items.name,
            }));
        }).flat();

        return {
            type: config.type.toLowerCase(),
            data: {
                values,
            },
            xField: SpecFields.xField,
            yField: SpecFields.yField,
            seriesField: SpecFields.seriesField,
        };
    },
};
