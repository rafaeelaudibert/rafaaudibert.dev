import React from 'react';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import { Wrapper } from './styles';

const NavbarLinks = ({ desktop }) => (
  <Wrapper desktop={desktop}>
    <AnchorLink href="#projects">Projects</AnchorLink>
    <AnchorLink href="#skills">Skills</AnchorLink>
    <AnchorLink href="#contact">Contact</AnchorLink>
    <a href="https://blog.rafaaudibert.dev">Blog</a>
  </Wrapper>
);

export default NavbarLinks;
