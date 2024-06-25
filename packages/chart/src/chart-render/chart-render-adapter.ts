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

import type { ChartRenderHelper } from '../chart-dom/chart-dom-container';
import type { ChartStyle, IChartConfig } from '../chart/types';
import { ChartRenderModel } from './chart-render-model';
import type { ChartRenderEngine, IChartRenderEngineConstructor } from './render-engine';

export class ChartRenderAdapter {
    private _renderModelMap = new Map<string, ChartRenderModel>();
    private _renderEngineConstructors = new Map<string, IChartRenderEngineConstructor>();
    private _renderEngineMap = new Map<string, ChartRenderEngine>();
    private _currentEngineName: string = '';
    private _renderHelper: ChartRenderHelper;

    bindRenderHelper(renderHelper: ChartRenderHelper) {
        this._renderHelper = renderHelper;
    }

    registerRenderEngine(name: string, ctor: IChartRenderEngineConstructor) {
        this._currentEngineName = name;
        this._renderModelMap.set(name, new ChartRenderModel());
        this._renderEngineConstructors.set(name, ctor);
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
        let renderEngine = _renderEngineMap.get(id);

        if (!renderModel) {
            return;
        }

        const spec = renderModel.getRenderSpec(renderModel.getChartConfig(config), style);
        if (renderEngine) {
            renderEngine.setData(spec);
        } else if (Ctor) {
            const helper = await this._renderHelper(id);
            renderEngine = new Ctor(id);
            renderEngine.setData(spec);
            helper.dispose && renderEngine.onDispose(helper.dispose);
            _renderEngineMap.set(id, renderEngine);
        }
    }

    renderStyle(id: string, style: ChartStyle) {
        const { _currentEngineName, _renderModelMap, _renderEngineMap } = this;
        const renderModel = _renderModelMap.get(_currentEngineName);
        const renderEngine = _renderEngineMap.get(id);
        if (renderModel && renderEngine) {
            const spec = renderModel.getRenderSpec(renderModel.config, style);

            renderEngine.setData(spec);
        }
    }

    dispose() {
        this._currentEngineName = '';
        this._renderModelMap.forEach((model) => model.dispose());
        this._renderModelMap.clear();
    }
}
