import Head from "next/head";
import { LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import type { GetStaticProps, GetStaticPaths } from "next";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";

dayjs.extend(relativeTime);

const ProfileFeed = (props: {userId: string}) => {
  const {data, isLoading} = api.post.getPostsByUserId.useQuery({userId: props.userId})

  if (isLoading) return <LoadingPage />;

  if (!data || data.length == 0) return <div>User has not posted</div>;

  return (<div className="flex flex-col">
    {data.map((fullPost) => (<PostView {...fullPost} key={fullPost.post.id} />))}
  </div>
  )
}
type ProfilePageProps = {
  username: string;
};

const ProfilePage = ({ username }: ProfilePageProps) =>{


  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;
  
  return (
    <>
      <Head>
        <title>{data.username ?? data.externalUsername}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 min-h-36 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${
              data.username ?? data.externalUsername ?? "unknown"
            }'s profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px] min-h-16"></div>
        <div className="p-4 text-2xl font-bold">{`@${
          data.username ?? data.externalUsername ?? "unknown"
        }`}</div>
        <div className="w-full border-b border-slate-400" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};
export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;