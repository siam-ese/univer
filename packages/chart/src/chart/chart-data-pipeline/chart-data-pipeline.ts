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

import type { ChartDataSource, ChartDataSourceValue, IChartData, IChartDataContext } from '../types';
import { CategoryType } from '../constants';
import {
    aggregateOperator,
    dataDirectionOperator,
    findCategoryOperator,
    findHeaderOperator,
    toString } from './utils';

export type IChartDataPipelineOperator = (ctx: IChartDataPipelineContext) => void;
export interface IChartDataPipelineContext {
    dataSource: ChartDataSource;
    dataConfig: IChartDataContext;
    _headerData?: ChartDataSourceValue[];
}

export class ChartDataPipeline {
    private _operators: IChartDataPipelineOperator[] = [];

    pipe(...operators: IChartDataPipelineOperator[]) {
        this._operators = this._operators.concat(operators);
        return this;
    }

    getOutput(dataSource: ChartDataSource, dataConfig: IChartDataContext) {
        const ctx = {
            dataSource,
            dataConfig,
        };
        this._operators.forEach((operator) => operator(ctx));

        return this._generateOutput(ctx);
    }

    _generateOutput(ctx: IChartDataPipelineContext): IChartData {
        const { dataSource, dataConfig, _headerData: headerData } = ctx;

        const seriesIndexes = dataConfig.seriesIndexes || dataSource.map((_, i) => i).filter((i) => i !== dataConfig.categoryIndex);

        const result: IChartData = {
            series: seriesIndexes.map((index) => {
                const values = dataSource[index];
                return {
                    index,
                    name: toString(headerData?.[index]),
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
                name: toString(headerData?.[categoryIndex]),
                type: dataConfig.categoryType!,
                items: categoryData.map((value) => ({
                    value,
                    label: toString(value),
                })),
                getValueByIndex(index: number) {
                    return this.type === CategoryType.Text ? this.items[index].label : undefined;
                },
            };
        }

        return result;
    }
}

export const chartDataPipeline = new ChartDataPipeline()
    .pipe(
        dataDirectionOperator,
        findHeaderOperator,
        findCategoryOperator,
        aggregateOperator
    );
