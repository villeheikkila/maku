import {
  ErrorAlert,
  SettingsLayout,
  SocialLoginOptions,
  SpinPadded,
} from "@pwa/components";
import {
  useCurrentUserAuthenticationsQuery,
  UserAuthentication,
  useSharedQuery,
  useUnlinkUserAuthenticationMutation,
} from "@pwa/graphql";
import { NextPage } from "next";
import React, { useCallback, useState } from "react";

const AUTH_NAME_LOOKUP = {
  github: "GitHub",
  facebook: "Facebook",
  twitter: "Twitter",
};
function authName(service: string) {
  return AUTH_NAME_LOOKUP[service] || service;
}

function UnlinkAccountButton({ id }: { id: string }) {
  const [mutate] = useUnlinkUserAuthenticationMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUnlink = useCallback(async () => {
    setModalOpen(false);
    setDeleting(true);
    try {
      await mutate({ variables: { id } });
    } catch (e) {
      setDeleting(false);
    }
  }, [id, mutate]);

  return (
    <>
      <div style={{ visibility: modalOpen ? "visible" : "hidden" }}>
        Are you sure? If you unlink this account you won't be able to log in
        with it any more; please make sure your email is valid.
      </div>
      <a key="unlink" onClick={handleUnlink}>
        {deleting ? <div>Loading...</div> : "Unlink"}
      </a>
    </>
  );
}

function renderAuth(
  auth: Pick<UserAuthentication, "id" | "service" | "createdAt">
) {
  return (
    <div key={auth.id}>
      <div>
        title {<strong>{authName(auth.service)}</strong>}
        {`Added ${new Date(Date.parse(auth.createdAt)).toLocaleString()}`}
        <UnlinkAccountButton key="unlink" id={auth.id} />
      </div>
    </div>
  );
}

const Settings_Accounts: NextPage = () => {
  const { data, loading, error } = useCurrentUserAuthenticationsQuery();

  const linkedAccounts =
    loading || !data || !data.currentUser ? (
      <SpinPadded />
    ) : (
      <div>{data.currentUser.authentications.map(renderAuth)}</div>
    );

  const query = useSharedQuery();

  return (
    <SettingsLayout href="/settings/accounts" query={query}>
      <header>
        <h1>Linked accounts</h1>
      </header>
      {error && !loading ? <ErrorAlert error={error} /> : linkedAccounts}
      <div>
        Link another account
        <SocialLoginOptions
          next="/settings/accounts"
          buttonTextFromService={(service) => `Link ${service} account`}
        />
      </div>
    </SettingsLayout>
  );
};

export default Settings_Accounts;
