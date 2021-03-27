import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { RichText } from "prismic-dom";

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Utteranc from '../../components/Uterranc';
import Link from 'next/link';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  previous_post: PostNavigation;
  next_post: PostNavigation;
  data: {
    title: string;
    subtitle: string;
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

interface PostNavigation {
  title: string | null;
  slug: string | null;
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  if (router.isFallback)
    return <div>Carregando...</div>

  const wordsAmount = Math.ceil(post.data.content.reduce((arr, actual) => {
    return arr + RichText.asText(actual.body).split(' ').length;
  }, 0) / 200);

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
            {wordsAmount} min
          </span>
        </div>
        {post.last_publication_date &&
          <div className={styles.editedInfo}>
            <span>{format(new Date(post.first_publication_date), "'* editado em 'd MMM y, 'às' hh:mm", { locale: ptBR })}</span>
          </div>
        }
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
        <div className={styles.postFooter}>
          <div>
            {post.previous_post &&
              <>
                <span>{post.previous_post.title}</span>
                <Link href={`/post/${post.previous_post.slug}`}>
                  <a>Post anterior</a>
                </Link>
              </>
            }
          </div>
          <div>
            {post.next_post &&
              <>
                <span>{post.next_post.title}</span>
                <Link href={`/post/${post.next_post.slug}`}>
                  <a>Próximo post</a>
                </Link>
              </>
            }
          </div>
        </div>
        <Utteranc />
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
  const previous = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ], {
    fetch: ['posts.uid', 'posts.title'],
    pageSize: 1,
    orderings: '[document.last_publication_date]',
    after: slug
  });
  const next = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ], {
    fetch: ['posts.uid', 'posts.title'],
    pageSize: 1,
    orderings: '[document.last_publication_date desc]',
    after: slug
  });

  const previous_post: PostNavigation = previous.results.length > 0 && previous.results[0].uid !== slug ? { title: previous.results[0].data?.title, slug: previous.results[0].uid } : null;
  const next_post: PostNavigation = next.results.length > 0 && next.results[0].uid !== slug ? { title: next.results[0].data?.title, slug: next.results[0].uid } : null;

  const post: Post = {
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    previous_post,
    next_post,
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
