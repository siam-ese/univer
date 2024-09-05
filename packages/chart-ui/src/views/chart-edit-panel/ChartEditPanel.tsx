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

import { Button } from '@univerjs/design';
import React, { useState } from 'react';
import clsx from 'clsx';
import { DataTabPanel } from './data-tab-panel';
import { StyleTabPanel } from './style-tab-panel';
import styles from './index.module.less';
import 'rc-collapse/assets/index.css';

export const ChartEditPanel = () => {
    const [tab, setTab] = useState(0);
    return (
        <div className={styles.chartEditPanel}>
            <div className={styles.chartEditPanelTabs}>
                <div className={clsx(styles.chartEditPanelTab, {
                    [styles.chartEditPanelTabActive]: tab === 0,
                })}
                >
                    <Button
                        className={clsx(styles.chartEditPanelTabBtn, {
                            [styles.chartEditPanelTabBtnActive]: tab === 0,
                        })}
                        type="text"
                        onClick={() => setTab(0)}
                    >
                        Setup
                    </Button>
                </div>
                <div className={clsx(styles.chartEditPanelTab, {
                    [styles.chartEditPanelTabActive]: tab === 1,
                })}
                >
                    <Button
                        className={clsx(styles.chartEditPanelTabBtn, {
                            [styles.chartEditPanelTabBtnActive]: tab === 1,
                        })}
                        type="text"
                        onClick={() => setTab(1)}
                    >
                        Customize
                    </Button>
                </div>
            </div>
            <div>
                {tab === 0 ? <DataTabPanel /> : <StyleTabPanel />}
            </div>
        </div>
    );
};
