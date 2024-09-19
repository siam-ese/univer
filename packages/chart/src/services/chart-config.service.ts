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
import { Disposable, ICommandService, Inject, Injector, LifecycleStages, LocaleService, OnLifecycle } from '@univerjs/core';
import { BehaviorSubject, combineLatestWith, debounceTime } from 'rxjs';
import { findCategoryOperator, findHeaderOperator, findSeriesOperator } from '../chart/chart-data-operators';
import type { IChartModelInit } from '../chart/chart-model';
import { ChartModel } from '../chart/chart-model';
import type { IChartConfig, IChartConfigConverter } from '../chart/types';
import type { IChartUpdateConfigMutationParams } from '../commands/sheets-chart-update-config.mutation';
import { ChartUpdateConfigMutation } from '../commands/sheets-chart-update-config.mutation';
import { IChartHostProvider } from './chart-host-provider';
import { ChartRenderService } from './chart-render.service';

export const SHEET_CHART_PLUGIN = 'SHEET_CHART_PLUGIN';

const DEBOUNCE_TIME = 100;
@OnLifecycle(LifecycleStages.Rendered, ChartModelService)
export class ChartModelService extends Disposable {
    private readonly _activeChartModel$ = new BehaviorSubject<Nullable<ChartModel>>(null);
    readonly activeChartModel$ = this._activeChartModel$.asObservable();
    get activeChartModel(): Nullable<ChartModel> { return this._activeChartModel$.getValue(); }

    private _models = new Map<string, ChartModel>();
    private _converters = new Set<IChartConfigConverter>();

    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(ChartRenderService) private _chartRenderService: ChartRenderService,
        @IChartHostProvider private _chartHostProvider: IChartHostProvider,
        @Inject(LocaleService) private _localeService: LocaleService,
        @ICommandService private _commandService: ICommandService
    ) {
        super();

        this.disposeWithMe(
            this._chartHostProvider.removeHost$.subscribe((id) => {
                this.removeChartModel(id);
            })
        );
    }

    setActiveChartModel(chartModel: ChartModel) {
        this._activeChartModel$.next(chartModel);
    }

    getChartModel(id: string) {
        return this._models.get(id);
    }

    createChartModel(id: string, options: IChartModelInit) {
        const { dataSource } = options;
        const chartModel = new ChartModel(id, options, this._injector);

        this._models.set(chartModel.id, chartModel);

        let latestConfig: Nullable<IChartConfig>;
        this.disposeWithMe(() => {
            latestConfig = undefined;
        });

        this.disposeWithMe(
            chartModel.config$.pipe(
                combineLatestWith(chartModel.style$),
                debounceTime(DEBOUNCE_TIME)
            ).subscribe(([config, style]) => {
                if (!config) {
                    return;
                }

                const { t } = this._localeService;
                config.category?.items.forEach((item, index) => {
                    if (!item.label) {
                        item.label = `${t('chart.category')} ${index + 1}`;
                    }
                });
                config.series.forEach((series, index) => {
                    if (!series.name) {
                        series.name = `${t('chart.series')} ${index + 1}`;
                    }
                });

                style.runtime = chartModel.getRuntimeContext();

                if (latestConfig !== config) {
                    latestConfig = config;
                    this._chartRenderService.render(chartModel.id, config, style);
                } else {
                    this._chartRenderService.renderStyle(chartModel.id, style);
                }
            })
        );

        this.disposeWithMe(
            dataSource.rebuild$.pipe(
                debounceTime(DEBOUNCE_TIME)
            ).subscribe(() => {
                const operators = [
                    findHeaderOperator,
                    findCategoryOperator,
                    findSeriesOperator,
                ];

                const newContext = operators.reduce((ctx, operator) => {
                    const newCtx = operator(dataSource.data, ctx);

                    return {
                        ...ctx,
                        ...newCtx,
                    };
                }, chartModel.context);

                const params: IChartUpdateConfigMutationParams = {
                    chartModelId: chartModel.id,
                    context: newContext,
                };

                this._commandService.executeCommand(ChartUpdateConfigMutation.id, params);
            })
        );

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
