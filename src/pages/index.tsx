import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';
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
}

export default function Home({ postsPagination }: HomeProps) {
  console.log(postsPagination)
  return (
    <div className={styles.postContainer}>
      <div className={styles.post}>
        <h1>Como utilizar Hooks</h1>
        <span>Pensando em sincronização em vez de ciclos de vida.</span>
        <div className={styles.postFooter}>
          <span>
            <FiCalendar />
            15 Mar 2021
          </span>
          <span>
            <FiUser />
            Joseph Oliveira
          </span>
        </div>
      </div>
      <div className={styles.post}>
        <h1>Como utilizar Hooks</h1>
        <span>Pensando em sincronização em vez de ciclos de vida.</span>
        <div className={styles.postFooter}>
          <span>
            <FiCalendar />
            15 Mar 2021
          </span>
          <span>
            <FiUser />
            Joseph Oliveira
          </span>
        </div>
      </div>
      <div className={styles.post}>
        <h1>Como utilizar Hooks</h1>
        <span>Pensando em sincronização em vez de ciclos de vida.</span>
        <div className={styles.postFooter}>
          <span>
            <FiCalendar />
            15 Mar 2021
          </span>
          <span>
            <FiUser />
            Joseph Oliveira
          </span>
        </div>
      </div>
      <div className={styles.post}>
        <h1>Como utilizar Hooks</h1>
        <span>Pensando em sincronização em vez de ciclos de vida.</span>
        <div className={styles.postFooter}>
          <span>
            <FiCalendar />
            15 Mar 2021
          </span>
          <span>
            <FiUser />
            Joseph Oliveira
          </span>
        </div>
      </div>
      <div className={styles.post}>
        <h1>Como utilizar Hooks</h1>
        <span>Pensando em sincronização em vez de ciclos de vida.</span>
        <div className={styles.postFooter}>
          <span>
            <FiCalendar />
            15 Mar 2021
          </span>
          <span>
            <FiUser />
            Joseph Oliveira
          </span>
        </div>
      </div>
      <div className={styles.loadPosts}>
        <span>Carregar mais posts</span>
      </div>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 2
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author
            }
          }
        })
      }
    },
    revalidate: 60 * 60 * 1, // 1 hours
  }
};
