import { Card, Layout, SharedLayout, Stars } from "@pwa/components";
import {
  CheckInsByUsernameQuery,
  useCheckInsByUsernameQuery,
} from "@pwa/graphql";
import { getDisplayName, paths } from "@pwa/common";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FC } from "react";
import { z } from "zod";

const parseSlug = z.string();

const UserPage: NextPage = () => {
  const router = useRouter();
  const username = parseSlug.parse(router.query.username);

  const user = useCheckInsByUsernameQuery({
    variables: {
      username,
    },
  });

  const data = user.data?.userByUsername;

  return (
    <SharedLayout
      title={`${data?.id ?? username}`}
      query={user}
    >
      {data && <UserPageInner user={data} />}
    </SharedLayout>
  );
};

interface UserPageInnerProps {
  user: CheckInsByUsernameQuery["userByUsername"];
}

const UserPageInner: FC<UserPageInnerProps> = ({ user }) => {
  return (
    <Layout.Root>
      <Layout.Header>
        <h1>{user && getDisplayName(user)}</h1>
        <p>Total check-ins: {user?.authoredCheckIns.totalCount}</p>
      </Layout.Header>
      <Card.Container>
        {user?.authoredCheckIns.nodes.map(({ id, item, rating }) => (
          <Card.Wrapper key={id}>
            <p>
              <b>{getDisplayName(user)}</b> has tasted{" "}
              <Link
                href={`/c/${item?.brand?.company?.name}/${item?.id}`}
              >{`${item?.brand?.name} - ${item?.flavor}`}</Link>{" "}
              by{" "}
              <Link href={`/c/${item?.brand?.company?.name}`}>
                {item?.brand?.company?.name}
              </Link>
            </p>
            {rating && <Stars rating={rating} />}
          </Card.Wrapper>
        ))}
      </Card.Container>
    </Layout.Root>
  );
};

export default UserPage;