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
import { addInterceptors, ChartRenderModel } from '../chart-render/chart-render-model';
import type { IChartRenderEngine, IChartRenderEngineConstructor } from '../chart-render/render-engine/render-engine';
import type { ChartStyle } from '../chart/style.types';
import type { IChartConfig } from '../chart/types';
import { IChartHostProvider } from './chart-host-provider';

export class SheetsChartRenderService extends Disposable {
    private _renderModelMap = new Map<string, ChartRenderModel>();
    private _renderEngineConstructors = new Map<string, IChartRenderEngineConstructor>();
    private _renderEngineMap = new Map<string, IChartRenderEngine>();
    private _currentEngineName: string = '';

    constructor(
        @IChartHostProvider private _chartHostProvider: IChartHostProvider
    ) {
        super();
    }

    registerRenderEngine(name: string, ctor: IChartRenderEngineConstructor) {
        this._currentEngineName = name;
        const renderModel = new ChartRenderModel();
        addInterceptors(renderModel);
        this._renderModelMap.set(name, renderModel);
        this._renderEngineConstructors.set(name, ctor);

        return renderModel;
    }

    getRenderModel(name: string = this._currentEngineName) {
        return this._renderModelMap.get(name);
    }

    switchModelTo(name: string) {
        this._currentEngineName = name;
    }

    async render(id: string, config: IChartConfig, style: ChartStyle) {
        const { _currentEngineName, _renderModelMap, _renderEngineConstructors, _renderEngineMap } = this;
        const renderModel = _renderModelMap.get(_currentEngineName);
        const Ctor = _renderEngineConstructors.get(_currentEngineName);

        if (!renderModel) {
            return;
        }

        let renderEngine = _renderEngineMap.get(id);

        if (!renderEngine && Ctor) {
            const host = this._chartHostProvider.createHost(id);

            renderEngine = new Ctor(host.id);
            host.dispose && renderEngine.onDispose?.(host.dispose);
            _renderEngineMap.set(id, renderEngine);
        }

        if (renderEngine) {
            const spec = renderModel.getRenderSpec(renderModel.getChartConfig(config), style, renderEngine);
            renderEngine.render(spec);
        }
    }

    renderStyle(id: string, style: ChartStyle) {
        const { _currentEngineName, _renderModelMap, _renderEngineMap } = this;
        const renderModel = _renderModelMap.get(_currentEngineName);
        const renderEngine = _renderEngineMap.get(id);
        if (!renderEngine || !renderModel) {
            return;
        }

        const spec = renderModel.getRenderSpec(renderModel.config, style, renderEngine);

        renderEngine.render(spec);
    }

    override dispose() {
        super.dispose();
        this._currentEngineName = '';

        this._renderEngineConstructors.clear();

        this._renderEngineMap.forEach((engine) => engine.dispose());
        this._renderEngineMap.clear();

        this._renderModelMap.forEach((model) => model.dispose());
        this._renderModelMap.clear();
    }
}
