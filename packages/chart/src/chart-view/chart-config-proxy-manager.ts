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

import type { ChartModel } from '../chart/chart-model';
import { ChartConfigStateAccessor } from './chart-config-state-accessor';
import type { ChartConfigStateProxy } from './chart-config-state-proxy';
import { createChartConfigStateProxy } from './chart-config-state-proxy';

export class ChartConfigProxyManager {
    private _proxyMap = new Map<string, ChartConfigStateProxy>();
    private _viewStateAccessor = new ChartConfigStateAccessor();
    createConfigProxy(chartModel: ChartModel) {
        const stateProxy = createChartConfigStateProxy(chartModel, this._viewStateAccessor);
        this._proxyMap.set(chartModel.id, stateProxy);
        chartModel.onDispose(() => {
            this.removeConfigProxy(chartModel.id);
        });
        return stateProxy;
    }

    getConfigProxy(id: string) {
        return this._proxyMap.get(id);
    }

    removeConfigProxy(id: string) {
        const { _proxyMap } = this;
        if (_proxyMap.has(id)) {
            _proxyMap.delete(id);
        }
    }
}

export const chartConfigProxyManager = new ChartConfigProxyManager();
