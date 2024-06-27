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

import { ChartType, useActiveChartModel, useChartConfigState, useChartConfigStateProxy } from '@univerjs/chart';
import type { ISelectProps } from '@univerjs/design';
import { Select } from '@univerjs/design';
import React from 'react';

export const DataTabPanel = () => {
    const chartModel = useActiveChartModel();

    const stateProxy = useChartConfigStateProxy(chartModel);
    const [chartType, setChartType] = useChartConfigState('chartType', stateProxy, ChartType.Line);
    const chartTypeOptions: ISelectProps['options'] = [
        {
            label: 'Line',
            value: ChartType.Line,
        },
        {
            label: 'Bar',
            value: ChartType.Bar,
        },
        {
            label: 'BarStacked',
            value: ChartType.BarStacked,
        },
        {
            label: 'Pie',
            value: ChartType.Pie,
        },
    ];
    return (
        <div>
            <span>DataTabPanel</span>
            <Select value={chartType} options={chartTypeOptions} onChange={(v) => setChartType(v as ChartType)}></Select>
        </div>
    );
};
