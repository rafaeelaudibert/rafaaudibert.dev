import React from 'react';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import { Header } from 'components/theme';
import { Container, Button } from 'components/common';
import dev from 'assets/illustrations/dev.svg';
import { Wrapper, IntroWrapper, Details, Thumbnail } from './styles';

export const Intro = () => (
  <Wrapper>
    <Header />
    <IntroWrapper as={Container}>
      <Details>
        <h1>Hi There!</h1>
        <h4>I’m Rafa and I’m a Junior Backend engineer!</h4>
        <Button as={AnchorLink} href="#contact">
          Talk to me
        </Button>
      </Details>
      <Thumbnail>
        <img src={dev} alt="I’m Rafa and I’m a Junior Backend engineer!" />
      </Thumbnail>
    </IntroWrapper>
  </Wrapper>
);
