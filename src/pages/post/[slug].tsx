import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import React from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { RichText } from "prismic-dom";

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  const wordsAmount = post.data.content.reduce((arr, actual) => {
    return arr + RichText.asText(actual.body).split(' ').length;
  }, 0);

  const wordsAmountFormatted = Math.ceil(wordsAmount / 200);

  return (
    <>
      <Header />
      <img className={styles.banner} src={post.data.banner.url} alt="Banner do Post" />
      <div className={styles.postContainer}>
        <h1>{post.data.title}</h1>
        <div className={styles.postDetails}>
          <span>
            <FiCalendar />
            {format(new Date(post.first_publication_date), 'd MMM y', { locale: ptBR })}
          </span>
          <span>
            <FiUser />
            {post.data.author}
          </span>
          <span>
            <FiClock />
            {wordsAmountFormatted} min
          </span>
        </div>
        {post.data.content.map(content => (
          <div key={content.heading} className={styles.postContent}>
            <h2>{content.heading}</h2>
            {
              content.body.map((body, index) => (
                <p key={index}>{body.text}</p>
              ))
            }
          </div>
        ))}
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ], {
    fetch: ['posts.uid'],
    pageSize: 1
  });

  const paths = postsResponse.results.map(item => {
    return {
      params: {
        slug: item.uid
      }
    }
  })

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context?.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body.map(item => ({ spans: item.spans, text: item.text, type: item.type }))
        }
      })
    }
  }

  return {
    props: {
      post
    }
  };
};
