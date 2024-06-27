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

import { Disposable } from '@univerjs/core';
// import { ChartRenderManager } from '../chart-render/chart-render-adapter';
import type { ChartRenderAdapter } from '../chart-render/chart-render-adapter';
import type { IChartModelOption } from './chart-model';
import { ChartModel } from './chart-model';
import type { IChartConfigConverter, IChartData } from './types';
import type { ChartType } from './constants';

export class ChartModelManager extends Disposable {
    private _models = new Map<string, ChartModel>();
    private _converters = new Set<IChartConfigConverter>();

    constructor(private _chartRenderAdapter: ChartRenderAdapter) {
        super();
    }

    addConverter(handler: IChartConfigConverter) {
        this._converters.add(handler);
    }

    convertChartConfig(chartType: ChartType, chartData: IChartData) {
        const converter = Array.from(this._converters).find((converter) => converter.canConvert(chartType));

        return converter ? converter.convert(chartType, chartData) : null;
    }

    getChartModel(id: string) {
        return this._models.get(id);
    }

    createChartModel(option: IChartModelOption) {
        const chartModel = new ChartModel(option, this);

        this.disposeWithMe(
            chartModel.config$.subscribe((config) => {
                if (config) {
                    this._chartRenderAdapter.render(chartModel.id, config, chartModel.style);
                }
            })
        );
        this.disposeWithMe(
            chartModel.style$.subscribe((style) => {
                this._chartRenderAdapter.renderStyle(chartModel.id, style);
            })
        );

        this._models.set(chartModel.id, chartModel);

        return chartModel;
    }

    removeChartModel(id: string) {
        const { _models } = this;
        const chartModel = _models.get(id);
        if (chartModel) {
            chartModel.dispose();
            _models.delete(id);
        }
    }

    override dispose() {
        super.dispose();
        this._models.forEach((model) => model.dispose());
    }
}
