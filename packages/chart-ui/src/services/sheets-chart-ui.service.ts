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

import { Disposable, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import type { ChartModel, ChartType } from '@univerjs/chart';
import { SheetsChartConfigService } from '@univerjs/chart';
import type { Observable } from 'rxjs';
import { registryChartConfigState } from '../chart-view/registry';

export interface IChartConfigStateMap {
    stack: IChartConfigState<boolean>;
    chartType: IChartConfigState<ChartType>;
}

export type ChartConfigStateKey = keyof IChartConfigStateMap;
export type ChartConfigStateValue = InferChartConfigStateValue<ChartConfigStateKey>;

export type InferChartConfigStateValue<T extends ChartConfigStateKey, M = IChartConfigStateMap[T]> = M extends IChartConfigState<infer V> ? V : never;

export interface IChartConfigState<IChartConfigStateValue> {
    set(value: IChartConfigStateValue): void;
    get(): Observable<IChartConfigStateValue>;
};

@OnLifecycle(LifecycleStages.Rendered, SheetsChartUIService)
export class SheetsChartUIService extends Disposable {
    private _viewState = new Map<ChartConfigStateKey, (chartModel: ChartModel) => IChartConfigStateMap[ChartConfigStateKey]>();

    constructor(
        @Inject(SheetsChartConfigService) private readonly _sheetsChartConfigService: SheetsChartConfigService

    ) {
        super();
        registryChartConfigState(this);
    }

    registerViewState<T extends ChartConfigStateKey = ChartConfigStateKey>(id: T, state: (chartModel: ChartModel) => IChartConfigStateMap[T]) {
        this._viewState.set(id, state);
    }

    getViewState<V extends ChartConfigStateValue = ChartConfigStateValue>(id: ChartConfigStateKey): IChartConfigState<V> | undefined {
        const { activeChartModel } = this._sheetsChartConfigService;
        if (!activeChartModel) {
            return;
        }
        const viewState = this._viewState.get(id) as ((chartModel: ChartModel) => IChartConfigState<V>) | undefined;
        if (viewState) {
            return viewState(activeChartModel);
        }
    }

    removeViewState(id: ChartConfigStateKey) {
        const { _viewState } = this;
        if (_viewState.has(id)) {
            _viewState.delete(id);
        }
    }

    override dispose() {
        super.dispose();
    }
}
