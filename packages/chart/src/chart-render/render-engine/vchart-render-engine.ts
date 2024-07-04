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

import VChart from '@visactor/vchart';
import type { ISpec } from '@visactor/vchart';
import { Disposable } from '@univerjs/core';
import type { RenderSpecInterceptor } from '../types';
import type { IChartRenderEngine } from './render-engine';

export type VChartSpec = ISpec;
export const VChartRenderEngineName = 'VChart';

export type VChartRenderSpecInterceptor = RenderSpecInterceptor<VChartSpec>;
export class VChartRenderEngine extends Disposable implements IChartRenderEngine<VChartSpec> {
    static override name = VChartRenderEngineName;
    private _vchart: VChart | null;

    constructor(public container: HTMLElement | string) {
        super();
    }

    private _ensureChartInstance() {
        if (!this._vchart) {
            this._vchart = new VChart({
                type: '',
            }, {
                dom: this.container,
            });
        }
        return this._vchart!;
    }

    render(): void {
        const instance = this._ensureChartInstance();
        instance.renderSync();
    }

    renderWithData(spec: VChartSpec): void {
        this.setData(spec);
        this.render();
    }

    setData(spec: VChartSpec): void {
        const instance = this._ensureChartInstance();
        // console.log(spec, 'vchart spec');
        instance.updateSpec(spec, false);
    }

    setTheme(): void {
    }

    exportImg() {
        return Promise.resolve('');
    }

    onDispose(dispose: () => void): void {
        this.disposeWithMe(dispose);
    }
}
