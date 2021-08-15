import React from 'react';
import { Footer } from 'components/theme';
import { Minymon } from 'components/3rd-party/Minymon';
import { Global } from './styles';
import './fonts.css';

export const Layout = ({ children }) => (
  <>
    <Global />
    {children}
    <Footer />
    <Minymon />
  </>
);
