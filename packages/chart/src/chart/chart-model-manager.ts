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
import { ChartRenderAdapter } from '../chart-render/chart-render-adapter';
import { ChartGeneratorProvider } from './chart-generator-provider';
import type { IChartModelOption } from './chart-model';
import { ChartModel } from './chart-model';
// import type { IChartConfigConverter } from './types';

export class ChartModelManager extends Disposable {
    // private _generators = new Map<IChartConfigConverter['name'], IChartConfigConverter>();
    private _models = new Map<string, ChartModel>();
    private _generatorProvider = new ChartGeneratorProvider();
    readonly renderAdapter = new ChartRenderAdapter();
    private _currentChartModel: string;

    get generatorProvider() {
        return this._generatorProvider;
    }

    getChartModel(id: string) {
        return this._models.get(id);
    }

    createChartModel(option: IChartModelOption) {
        const chartModel = new ChartModel(option, this);

        this.disposeWithMe(
            chartModel.config$.subscribe((config) => {
                this.renderAdapter.render(chartModel.id, config, chartModel.style);
            })
        );
        this.disposeWithMe(
            chartModel.style$.subscribe((style) => {
                this.renderAdapter.renderStyle(chartModel.id, style);
            })
        );

        this._models.set(chartModel.id, chartModel);

        return chartModel;
    }

    // addChart(converter: IChartConfigConverter) {
    //     this._generatorProvider.addConverter(converter);
    // }

    override dispose() {
        super.dispose();
        this._models.forEach((model) => model.dispose());
    }
}
