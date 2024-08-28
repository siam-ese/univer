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

import type { Disposable, Nullable } from '@univerjs/core';

export interface IChartRenderEngine<Spec = unknown> extends Disposable {
    container: HTMLElement | string;

    render(spec: Spec): void;

    setTheme(): void;

    exportImg(): Promise<string>;

    setBorderColor(color: Nullable<string>): void;

    onDispose?(dispose: () => void): void;
}

export interface IChartRenderEngineConstructor<T = unknown> {
    new (container: HTMLElement | string): IChartRenderEngine<T>;
}

