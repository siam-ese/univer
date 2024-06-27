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

export abstract class ChartRenderEngine<T = unknown> {
    private _disposeEffects: Array<() => void > = [];
    constructor(public container: HTMLElement | string) {
    };

    public setData(spec: T): void {}
    public setTheme(): void {}
    public exportImg(): Promise<string> {
        return Promise.resolve('');
    }

    onDispose(effect: () => void) {
        this._disposeEffects.push(effect);
    }

    dispose(): void {
        this._disposeEffects.forEach((fn) => fn());
        this._disposeEffects = [];
    }
}

export interface IChartRenderEngineConstructor<T = unknown> {
    // name: string;
    new (container: HTMLElement | string): ChartRenderEngine<T>;
}

