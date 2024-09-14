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
import type { IChartRenderModel } from '../chart-render/chart-render-model';
import type { IChartInstance } from '../chart-render/chart-instance';
import type { ChartStyle } from '../chart/style.types';
import type { IChartConfig } from '../chart/types';
import { EChartRenderModel } from '../chart-render/echart-render-model';
import { IChartHostProvider } from './chart-host-provider';

export class ChartRenderService extends Disposable {
    private _renderModelMap = new Map<string, IChartRenderModel>();
    private _chartInstanceMap = new Map<string, IChartInstance>();
    private _chartConfigMap = new Map<string, IChartConfig>();
    private _currentModel: IChartRenderModel | null = null;

    constructor(
        @IChartHostProvider private _chartHostProvider: IChartHostProvider
    ) {
        super();

        this.registerRenderModel('VChart', new EChartRenderModel());
    }

    registerRenderModel(name: string, renderModel: IChartRenderModel) {
        this._renderModelMap.set(name, renderModel);
        this._currentModel = renderModel;
    }

    setRenderModel(name: string) {
        const renderModel = this._renderModelMap.get(name);
        if (renderModel) {
            this._currentModel = renderModel;
        }
    }

    getRenderModel(name: string) {
        return this._renderModelMap.get(name);
    }

    private _ensureChartInstance(id: string) {
        const { _chartInstanceMap, _currentModel } = this;
        if (_chartInstanceMap.has(id)) {
            return _chartInstanceMap.get(id)!;
        }
        const chartInstance = _currentModel!.createChartInstance();
        _chartInstanceMap.set(id, chartInstance);
        return chartInstance;
    }

    async render(id: string, config: IChartConfig, style: ChartStyle) {
        const { _currentModel, _chartConfigMap } = this;
        if (!_currentModel) {
            return;
        }
        _chartConfigMap.set(id, config);

        const chartInstance = this._ensureChartInstance(id);

        const chartHost = this._chartHostProvider.createHost(id);
        chartInstance.mount(chartHost.id);
        chartInstance.onDispose?.(() => chartHost.dispose?.());

        const spec = _currentModel.stylizeSpec(_currentModel.toSpec(config, style), {
            chartConfig: config,
            chartStyle: style,
            chartInstance,
        });

        chartInstance.render(spec);
    }

    renderStyle(id: string, style: ChartStyle) {
        const { _currentModel, _chartConfigMap } = this;
        if (!_currentModel) {
            return;
        }
        const chartInstance = this._ensureChartInstance(id);

        const config = _chartConfigMap.get(id);
        if (!config) {
            return;
        }
        const spec = _currentModel.stylizeSpec(_currentModel.toSpec(config, style), {
            chartConfig: config,
            chartStyle: style,
            chartInstance,
        });

        chartInstance.render(spec);
    }

    override dispose() {
        super.dispose();

        this._chartInstanceMap.clear();
        this._chartConfigMap.clear();
        this._currentModel = null;
        this._renderModelMap.forEach((model) => model.dispose());
        this._renderModelMap.clear();
    }
}
