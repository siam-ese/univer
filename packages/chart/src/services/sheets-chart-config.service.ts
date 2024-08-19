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

import type { Nullable } from '@univerjs/core';
import { Disposable, Inject, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import type { IChartModelOption } from '../chart/chart-model';
import { ChartModel } from '../chart/chart-model';
import type { ChartType } from '../chart/constants';
import type { IChartConfigConverter, IChartData } from '../chart/types';
import { SheetsChartRenderService } from './sheets-chart-render.service';

export const SHEET_CHART_PLUGIN = 'SHEET_CHART_PLUGIN';

@OnLifecycle(LifecycleStages.Rendered, SheetsChartConfigService)
export class SheetsChartConfigService extends Disposable {
    private readonly _activeChartModel$ = new BehaviorSubject<Nullable<ChartModel>>(null);
    readonly activeChartModel$ = this._activeChartModel$.asObservable();
    get activeChartModel(): Nullable<ChartModel> { return this._activeChartModel$.getValue(); }

    private _models = new Map<string, ChartModel>();
    private _converters = new Set<IChartConfigConverter>();

    constructor(
        @Inject(SheetsChartRenderService) private _chartRenderAdapter: SheetsChartRenderService
    ) {
        super();
    }

    setActiveChartModel(chartModel: ChartModel) {
        this._activeChartModel$.next(chartModel);
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

    createChartModel(option: Omit<IChartModelOption, 'convertConfig'>) {
        const chartModel = new ChartModel({
            ...option,
            convertConfig: this.convertChartConfig.bind(this),
        });

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
        this._models.clear();
        this._converters.clear();
    }
}
