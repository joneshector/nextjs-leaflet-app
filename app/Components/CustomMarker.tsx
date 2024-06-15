'use client';
import React from 'react';
import { Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LeafletMouseEventHandlerFn } from 'leaflet';

type Props = {
    index: number;
    customIcon: L.Icon<L.IconOptions>;
    location: number[];
    clickedOnMarker: LeafletMouseEventHandlerFn;
};

const CustomMarker = (props: Props) => {
    return (
        <Marker
            key={props.index}
            position={[props.location[0], props.location[1]]}
            icon={props.customIcon}
            eventHandlers={{
                click: props.clickedOnMarker,
            }}
        />
    );
};

export default CustomMarker;
