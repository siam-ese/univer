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
import { BehaviorSubject, combineLatestWith, debounceTime } from 'rxjs';
import type { IChartModelInit } from '../chart/chart-model';
import { ChartModel } from '../chart/chart-model';
import type { ChartTypeBits } from '../chart/constants';
import type { IChartConfig, IChartConfigConverter, IChartData } from '../chart/types';
import { generalChartConverter } from '../chart/converters';
import { SheetsChartRenderService } from './sheets-chart-render.service';
import { IChartHostProvider } from './chart-host-provider';

export const SHEET_CHART_PLUGIN = 'SHEET_CHART_PLUGIN';

@OnLifecycle(LifecycleStages.Rendered, SheetsChartConfigService)
export class SheetsChartConfigService extends Disposable {
    private readonly _activeChartModel$ = new BehaviorSubject<Nullable<ChartModel>>(null);
    readonly activeChartModel$ = this._activeChartModel$.asObservable();
    get activeChartModel(): Nullable<ChartModel> { return this._activeChartModel$.getValue(); }

    private _models = new Map<string, ChartModel>();
    private _converters = new Set<IChartConfigConverter>();

    constructor(
        @Inject(SheetsChartRenderService) private _chartRenderService: SheetsChartRenderService,
        @IChartHostProvider private _chartHostProvider: IChartHostProvider
    ) {
        super();

        this.disposeWithMe(
            this._chartHostProvider.removeHost$.subscribe((id) => {
                this.removeChartModel(id);
            })
        );

        this._initConverters();
    }

    setActiveChartModel(chartModel: ChartModel) {
        this._activeChartModel$.next(chartModel);
    }

    private _initConverters() {
        const { _converters } = this;

        _converters.add(generalChartConverter);
        // _converters.add(combinationChartConverter);
    }

    toChartConfig(chartType: ChartTypeBits, chartData: IChartData) {
        const converter = Array.from(this._converters).find((converter) => converter.canConvert(chartType));

        return converter ? converter.convert(chartType, chartData) : null;
    }

    getChartModel(id: string) {
        return this._models.get(id);
    }

    createChartModel(id: string, option: Omit<IChartModelInit, 'toChartConfig'>) {
        const chartModel = new ChartModel(id, {
            ...option,
            toChartConfig: this.toChartConfig.bind(this),
        });

        let latestConfig: Nullable<IChartConfig>;
        this.disposeWithMe(() => {
            latestConfig = undefined;
        });

        this.disposeWithMe(
            chartModel.config$.pipe(
                combineLatestWith(chartModel.style$),
                debounceTime(200)
            ).subscribe(([config, style]) => {
                if (!config) {
                    return;
                }
                if (latestConfig !== config) {
                    latestConfig = config;
                    this._chartRenderService.render(chartModel.id, config, style);
                } else {
                    this._chartRenderService.renderStyle(chartModel.id, style);
                }
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
