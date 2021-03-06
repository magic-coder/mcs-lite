/**
 * svgtoreact
 *
 * @author Michael Hsu
 */

import React from 'react';

export default function SVGSignal(props) {
  return (
    <svg width={80} height={61} viewBox="0 0 80 61" {...props}>
      <g fill="none">
        <path
          d="M76.04 22.574c-1.014 0-1.901-.38-2.661-1.141-18.503-18.376-48.412-18.376-66.915 0-1.521 1.521-3.929 1.521-5.323 0-1.521-1.521-1.521-3.929 0-5.323 21.418-21.418 56.269-21.418 77.687 0 1.521 1.521 1.521 3.929 0 5.323-.76.76-1.774 1.141-2.788 1.141z"
          id="Shape"
          fill="#E6F5FB"
        />
        <path
          d="M62.733 36.008c-1.014 0-1.901-.38-2.661-1.141-11.152-11.152-29.149-11.152-40.301 0-1.521 1.521-3.929 1.521-5.323 0-1.521-1.521-1.521-3.929 0-5.323 14.067-14.067 36.879-14.067 50.947 0 1.521 1.521 1.521 3.929 0 5.323-.76.76-1.648 1.141-2.661 1.141z"
          fill="#CBECF9"
        />
        <path
          d="M49.046 48.808c-1.014 0-1.901-.38-2.661-1.141-3.549-3.549-9.378-3.549-12.927 0-1.521 1.521-3.929 1.521-5.323 0-1.521-1.521-1.521-3.929 0-5.323 6.463-6.463 17.109-6.463 23.572 0 1.521 1.521 1.521 3.929 0 5.323-.76.76-1.648 1.141-2.661 1.141z"
          fill="#97D9F2"
        />
        <circle fill="#97D9F2" cx="39.921" cy="56.792" r="3.802" />
      </g>
    </svg>
  );
}
