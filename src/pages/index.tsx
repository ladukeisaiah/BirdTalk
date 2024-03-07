import { SignIn, UserButton, useUser } from "@clerk/nextjs";
import { Post } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  if (!user) return null;

  return (<div className="flex gap-3 bg-red-200">
    <Image 
      src={user.imageUrl} 
      className="w-14 h-14 rounded-full" 
      alt="Profile Picture"
      width={56}
      height={56} />
    <input placeholder="Type some emojis!" className="grow bg-transparent"/>
  </div>
  );
};

type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  const defaultImageUrl = "/public/blank_profile_image.pdf";

  return (

    <div key={post.id} className="flex border-b border-slate-400 p-4 gap-3">
      <Image 
      src={author?.profileImageUrl || defaultImageUrl} 
      className="w-14 h-14 rounded-full"
      alt={`@${author.name}`}
      width={56}
      height={56}
       />
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">
          <span>{`@${author.name}`}</span>
          <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
      <span>{post.content}</span>
      </div>
    </div>

  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.post.getAll.useQuery();

  if (postsLoading) return <LoadingPage />

  if (!data) return <div>Something went wrong</div>

  return (
    <div className="flex flex-col">
            {[...data, ...data]?.map((fullPost) => (
          <PostView {...fullPost} key={fullPost.post.id}/>
          ))}
          </div>
  );
}

export default function Home() {
  // const hello = api.post.hello.useQuery({ text: "from tRPC" });
  const {user, isLoaded: userLoaded}  = useUser();

  // start fetching asap
  api.post.getAll.useQuery();

  // This will return empty div if user isn't loaded yet
  if (!userLoaded) return <div />;



  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center ">
      <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
        
        <header className="flex w-full gap-3 border-b border-slate-400 p-4">
          <div className="flex justify-center">
            <UserButton />
            </div>
            <div className="flex flex-grow">
            <input placeholder="Type some emojis!" className="min-w-0 flex-grow bg-transparent outline-none" style={{ minWidth: '150px' }}/>
            </div>
        </header>
        <Feed />
        </div>
      </main>
    </>
  );
}
