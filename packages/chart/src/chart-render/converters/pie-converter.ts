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

import type { IPieChartSpec } from '@visactor/vchart';
import type { IChartRenderSpecConverter } from '../types';
import { ChartType } from '../../chart/constants';
import { PieSpecField } from './constants';

export const pieConverter: IChartRenderSpecConverter<IPieChartSpec> = {
    canConvert(config) {
        return config.type === ChartType.Pie;
    },
    convert(config) {
        const unit = Array.isArray(config.units) ? config.units[0] : config.units;
        const { category, series } = unit.data;
        const values = series.map((ser) => {
            return ser.items.map((item, valueIndex) => ({
                [PieSpecField.categoryField]: category?.getValueByIndex(valueIndex),
                // [SpecFields.xField]: category?.getValueByIndex(valueIndex),
                [PieSpecField.valueField]: item.value,
            }));
        }).flat();

        return {
            type: 'pie',
            data: {
                values,
            },
            valueField: PieSpecField.valueField,
            categoryField: PieSpecField.categoryField,
        };
    },
};
