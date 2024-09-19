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

export interface IChartTheme {
    colors: string[];
}

export class ChartThemeService extends Disposable {
    private _themeMap = new Map<string, IChartTheme>();

    registerTheme(name: string, theme: IChartTheme) {
        this._themeMap.set(name, theme);
    }

    getTheme(name: string) {
        return this._themeMap.get(name);
    }

    override dispose() {
        super.dispose();
        this._themeMap.clear();
    }
}
