/* eslint-disable global-require, import/no-dynamic-require */

import React from 'react';
import { Container } from 'components/common';
import { Wrapper, Flex, Links, Details } from './styles';
import social from './social.json';

export const Footer = () => (
  <Wrapper>
    <Flex as={Container}>
      <Details>
        <h2>Rafa Audibert</h2>
        <span>
          © All rights are reserved | {new Date().getFullYear()} | Made with{' '}
          <span aria-label="love" role="img">
            💖
          </span>{' '}
          by{' '}
          <a href="https://inf.ufrgs.br/~rbaudibert" rel="noopener noreferrer" target="_blank">
            RafaAudibert
          </a>
        </span>
      </Details>
      <Links>
        {social.map(({ id, name, link, icon }) => {
          const img = require(`assets/img/${icon}`);

          return (
            <a key={id} href={link} target="_blank" rel="noopener noreferrer" aria-label={`follow me on ${name}`}>
              <img width="24" src={img} alt={name} />
            </a>
          );
        })}
      </Links>
    </Flex>
  </Wrapper>
);
