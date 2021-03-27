import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../components/Header';
interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [posts, setPosts] = useState<PostPagination>({} as PostPagination);

  useEffect(() => {
    setPosts({
      next_page: postsPagination.next_page,
      results: postsPagination.results
    });
  }, []);

  const handleNextPage = () => {
    fetch(posts.next_page).then(res => res.json()).then(data => {
      const results: Post[] = data.results.map(result => {
        return {
          uid: result.uid,
          first_publication_date: format(new Date(result.first_publication_date), 'd MMM y', { locale: ptBR }),
          data: {
            title: result.data.title,
            subtitle: result.data.subtitle,
            author: result.data.author
          }
        }
      })

      setPosts({
        next_page: data.next_page,
        results: [...posts.results, ...results]
      });
    });
  }

  return (
    <>
      <Header />
      <div className={styles.postsContainer}>
        {posts?.results?.map(post => (
          <Link href={`post/${post.uid}`} key={post.uid}>
            <div className={styles.post}>
              <h1>{post.data.title}</h1>
              <span>{post.data.subtitle}</span>
              <div className={styles.postFooter}>
                <span>
                  <FiCalendar />
                  {format(new Date(post.first_publication_date), 'd MMM y', { locale: ptBR })}
                </span>
                <span>
                  <FiUser />
                  {post.data.author}
                </span>
              </div>
            </div>
          </Link>
        ))}
        <div className={styles.loadPosts}>
          {posts.next_page ? <span onClick={handleNextPage}>Carregar mais posts</span> : ''}
        </div>
        {preview && (
          <Link href="/api/exit-preview">
            <button className={styles.preview}>
              Sair do modo Preview
            </button>
          </Link>
        )}
      </div>
    </>
  )
}


export const getStaticProps: GetStaticProps<HomeProps> = async ({ preview = false, previewData = {} }) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1,
    ref: previewData?.ref ?? null
  });

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results
      },
      preview
    },
  }
};
