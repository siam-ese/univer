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

import { useCallback, useMemo } from 'react';
import { useObservable } from '@univerjs/ui';
import type { ChartModel } from '../chart/chart-model';
import { chartConfigProxyManager } from './chart-config-proxy-manager';
import type { ChartConfigStateKey, ChartConfigStateValue, InferChartConfigStateValue } from './chart-config-state-accessor';
import type { ChartConfigStateProxy } from './chart-config-state-proxy';

export const useChartConfigStateProxy = (chartModel: ChartModel) => {
    const stateProxy = useMemo(() => {
        const proxy = chartConfigProxyManager.getConfigProxy(chartModel.id);
        return proxy || chartConfigProxyManager.createConfigProxy(chartModel);
    }, [chartModel]);

    return stateProxy;
};

export function useChartConfigState<V, T extends ChartConfigStateKey = ChartConfigStateKey>(
    key: T,
    stateProxy: ChartConfigStateProxy,
    defaultValue: V
): [V, (value: V) => void];
export function useChartConfigState<T extends ChartConfigStateKey = ChartConfigStateKey, V extends InferChartConfigStateValue<T> = InferChartConfigStateValue<T>>(
    key: T,
    stateProxy: ChartConfigStateProxy,
): [V | undefined, (value: V) => void];
export function useChartConfigState<T extends ChartConfigStateKey = ChartConfigStateKey, V extends InferChartConfigStateValue<T> = InferChartConfigStateValue<T>>(
    key: T,
    stateProxy: ChartConfigStateProxy,
    defaultValue?: undefined
): [V | undefined, (value: V) => void] {
    const observable = useMemo(() => stateProxy.get<V>(key), [stateProxy, key]);
    const state = useObservable<V>(observable, defaultValue);

    const setState = useCallback((value: V) => {
        stateProxy.set(key, value as ChartConfigStateValue);
    }, [stateProxy, key]);

    return [state, setState] as const;
}

