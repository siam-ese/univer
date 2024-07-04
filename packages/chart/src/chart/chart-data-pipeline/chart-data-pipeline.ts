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

import type { ChartDataSource, IChartData, IChartDataConfig } from '../types';
import {
    aggregateOperator,
    dataDirectionOperator,
    findCategoryOperator,
    findHeaderOperator,
    findSeriesOperator,
    toString } from './operators';

export type IChartDataPipelineOperator = (ctx: IChartDataPipelineContext) => void;
export interface IChartDataPipelineContext {
    dataSource: ChartDataSource;
    dataConfig: IChartDataConfig;
}

export class ChartDataPipeline {
    private _operators: IChartDataPipelineOperator[] = [];

    pipe(...operators: IChartDataPipelineOperator[]) {
        this._operators = this._operators.concat(operators);
        return this;
    }

    unpipe(operator: IChartDataPipelineOperator) {
        this._operators = this._operators.filter((op) => op !== operator);
        return this;
    }

    // When chart data source change, as range changed we should rebuild data context
    buildContext(dataSource: ChartDataSource, dataConfig: IChartDataConfig) {
        const ctx = {
            dataSource,
            dataConfig,
        };

        this._operators.forEach((operator) => operator(ctx));

        return ctx;
    }

    static getOutput(ctx: IChartDataPipelineContext): IChartData {
        const { dataSource, dataConfig } = ctx;
        const { headers } = dataConfig;

        const seriesIndexes = dataConfig.seriesIndexes || [];

        const result: IChartData = {
            series: seriesIndexes.map((index) => {
                const values = dataSource[index];
                return {
                    index,
                    name: toString(headers?.[index]) || `Series ${index}`,
                    items: values.map((value) => ({
                        value,
                        label: toString(value),
                    })),
                };
            }),
        };

        const categoryIndex = dataConfig.categoryIndex;
        if (categoryIndex !== undefined) {
            const categoryData = dataSource[categoryIndex];

            result.category = {
                index: categoryIndex,
                name: toString(headers?.[categoryIndex]),
                type: dataConfig.categoryType!,
                items: categoryData.map((value) => ({
                    value,
                    label: toString(value),
                })),
                keys: categoryData.map((value, index) => `${index}_${value}`),
            };
        }

        return result;
    }
}

export const dataSourcePipeline = new ChartDataPipeline()
    .pipe(
        dataDirectionOperator,
        findHeaderOperator,
        findCategoryOperator,
        findSeriesOperator
    );

export const outputPipeline = new ChartDataPipeline().pipe(aggregateOperator);
