import React, { useRef, useEffect } from 'react';
import { Graph3DApp } from './utils/graph3DApp';

import './graph.css';

const SceneGraph = () => {
    const ref = useRef({});
    useEffect(() => {
        const app = new Graph3DApp({
            canvas: ref.current as HTMLCanvasElement
        });
        app.render();
    }, []);
    return (
        <div className="graph-wrap">
            <canvas ref={ref as { current: HTMLCanvasElement }} id="c"></canvas>
        </div>
    );
};

export default SceneGraph;
