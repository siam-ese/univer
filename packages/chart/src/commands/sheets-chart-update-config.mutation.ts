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

import type { IMutation, IRange } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

import type { ChartTypeBits, DataOrientation } from '../chart/constants';
import type { ChartStyle } from '../chart/style.types';
import type { IChartContext, IChartDataAggregation } from '../chart/types';
import { SheetsChartService } from '../services/sheets-chart.service';

export interface IChartUpdateConfigMutationParams {
    chartModelId: string;
    orient?: DataOrientation;
    chartType?: ChartTypeBits;
    range?: IRange;
    dataAggregation?: Partial<IChartDataAggregation>;
    style?: ChartStyle;
    context?: IChartContext;
}

export const ChartUpdateConfigMutation: IMutation<IChartUpdateConfigMutationParams> = {
    id: 'sheet.mutation.chart-update-config',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const {
            range,
            orient,
            dataAggregation,
            style,
            context,
            chartType,
            chartModelId,
        } = params;

        const sheetChartService = accessor.get(SheetsChartService);
        const chartModel = sheetChartService.getChartModel(chartModelId);
        const dataSource = sheetChartService.getChartDataSource(chartModelId);
        if (dataSource) {
            if (range) {
                dataSource.setRange(range);
            }
            if (orient) {
                dataSource.setOrient(orient);
            }
        }
        if (chartModel) {
            if (style) {
                chartModel.applyStyle(style);
            }
            if (dataAggregation) {
                chartModel.assignDataAggregation(dataAggregation);
            }
            if (context) {
                chartModel.assignChartContext(context);
            }
            if (chartType) {
                chartModel.setChartType(chartType);
            }
        }

        return true;
    },
};
