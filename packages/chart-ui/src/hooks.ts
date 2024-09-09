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

import { useObservable } from '@univerjs/ui';
import { useCallback, useMemo } from 'react';
import { useDependency } from '@univerjs/core';
import { SheetsChartConfigService } from '@univerjs/chart';
import { Observable } from 'rxjs';
import type { ChartConfigStateKey, InferChartConfigStateValue } from './services/sheets-chart-ui.service';
import { SheetsChartUIService } from './services/sheets-chart-ui.service';

export function useSheetsChartUIService() {
    const sheetsChartUIService = useDependency(SheetsChartUIService);
    const sheetsChartConfigService = useDependency(SheetsChartConfigService);
    // chart ui service should update with activeChartModel change
    useObservable(sheetsChartConfigService.activeChartModel$);
// console.log(activeChartModel, 'activeChartModel')
    return sheetsChartUIService;
}

export function useChartConfigState<V, T extends ChartConfigStateKey = ChartConfigStateKey>(
    key: T,
    service: SheetsChartUIService,
    defaultValue: V
): [V, (value: V) => void];
export function useChartConfigState<T extends ChartConfigStateKey = ChartConfigStateKey, V extends InferChartConfigStateValue<T> = InferChartConfigStateValue<T>>(
    key: T,
    service: SheetsChartUIService,
): [V | undefined, (value: V) => void];
export function useChartConfigState<T extends ChartConfigStateKey = ChartConfigStateKey, V extends InferChartConfigStateValue<T> = InferChartConfigStateValue<T>>(
    key: T,
    service: SheetsChartUIService,
    defaultValue?: undefined
): [V | undefined, (value: V) => void] {
    const viewState = useMemo(() => service.getViewState<V>(key), [service, service.activeChartModel, key]);

    const observable = useMemo(() => viewState instanceof Observable ? viewState : viewState?.get(), [viewState]);

    const state = useObservable<V>(observable, defaultValue);

    const setState = useCallback((value: V) => {
        if (!(viewState instanceof Observable)) {
            viewState?.set?.(value);
        }
    }, [viewState]);

    return [state, setState] as const;
}

