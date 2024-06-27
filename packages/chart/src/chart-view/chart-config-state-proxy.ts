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

import type { Observable } from 'rxjs';
import type { ChartModel } from '../chart/chart-model';
import type { ChartConfigStateAccessor, ChartConfigStateKey, ChartConfigStateValue } from './chart-config-state-accessor';

export function createChartConfigStateProxy(chartModel: ChartModel, accessor: ChartConfigStateAccessor) {
    return {
        set(name: ChartConfigStateKey, value: ChartConfigStateValue) {
            const viewState = accessor.getViewState(name);
            if (viewState) {
                viewState(chartModel).set(value as never);
            }
        },
        get<V extends ChartConfigStateValue = ChartConfigStateValue>(name: ChartConfigStateKey): Observable<V> | undefined {
            const viewState = accessor.getViewState<V>(name);
            if (viewState) {
                return viewState(chartModel).get();
            }
        },
    } as const;
}

export type ChartConfigStateProxy = ReturnType<typeof createChartConfigStateProxy>;
