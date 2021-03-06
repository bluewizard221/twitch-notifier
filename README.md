# twitch-notifier


## 説明
Twitchで配信を始めた時にtwitterに自動的にツイートするbotです。

[![Image from Gyazo](https://i.gyazo.com/65d01ab3f039ea959f8a6e6be3f7f0b8.png)](https://gyazo.com/65d01ab3f039ea959f8a6e6be3f7f0b8)

こんな感じにツイートされます。


## Usage
```
twitch-notifier.js [-d]

オプション:
  -d: HUPシグナルを受け取った際にトークンを再発行します。
    デーモン化して継続的に利用する際に指定してください。
```


## 動作確認済み環境・必要モジュール

* 動作確認済み環境

  FreeBSD 12.1-RELEASE上のnode v15.3.0にて動作を確認出来ています。
* 必要モジュール

  twitch-webhook, twitter, request, fs, config, log4js


## 使用手順
1. 上記必要モジュールをインストールします。

2. twitch APIのOAuthトークンを以下のようにcurlで取得します。  
OAuthトークンについての詳細は以下を参照してください。  
https://dev.twitch.tv/docs/authentication/  
scopeについては以下を参照してください。  
https://dev.twitch.tv/docs/authentication/#scopes

```bash
curl -k 'https://id.twitch.tv/oauth2/token? \
client_id=<Client-ID>& \
client_secret=<ClientSecret>& \
grant_type=client_credentials& \
scope=user:read:broadcast+analytics:read:games' \
-X POST
```

3. discord通知用にwebhookを作成します。  
webhookの詳細・作成方法については以下を参照してください。
https://support.discord.com/hc/ja/articles/228383668-%E3%82%BF%E3%82%A4%E3%83%88%E3%83%AB-Webhooks%E3%81%B8%E3%81%AE%E5%BA%8F%E7%AB%A0

4. discord通知用のRoleをサーバーの中に作成します。 

5. discord通知用Role IDを取得します。  
Roleを追加したサーバー内の任意のテキストチャンネル内で  
以下のように入力するとRole IDを取得することが出来ます。

```
\@Role名
```

6. 設定ファイル(config/default.json)に以下の記述を書き入れます。

---
<dl>
<dt>pidFile</dt>
  <dd>pidファイルのファイルパスを設定します。-dオプションを付けて起動している時に、HUPシグナルを受け取った際にここに記述されるプロセスIDに対してHUPシグナルを送ります。</dd>
<dt>twitchUserId</dt>
  <dd>twitch APIで取得出来るユーザーID（数値）を設定します。</dd>
<dt>twitchCallBack</dt>
  <dd>twitchに通知するコールバックURLを設定します。</dd>
<dt>twitchClientId</dt>
  <dd>twitch APIのクライアントIDを設定します。</dd>
<dt>twitchSecret</dt>
  <dd>twitch webhook APIで使用するシークレットを設定します。任意の文字列を使ってください。</dd>
<dt>twitchOAuthtoken</dt>
  <dd>twitch APIのOAuthトークンを設定します。</dd>
<dt>twitchChannel</dt>
  <dd>実際に通知したいtwitchのチャンネル名を設定します。ここに書いたURLがツイートに載ります。</dd>
<dt>twitterConsumerKey</dt>
  <dd>twitter APIのコンシューマキーを設定します。</dd>
<dt>twitterConsumerSecret</dt>
  <dd>twitter APIのコンシューマシークレットを設定します。</dd>
<dt>twitterAccessTokenKey</dt>
  <dd>twitter APIのアクセストークンキーを設定します。</dd>
<dt>twitterAccessTokenSecret</dt>
  <dd>twitter APIのアクセストークンシークレットを設定します。</dd>
<dt>discordWebhookURL</dt>
  <dd>discordへの通知のためのwebhook URLを設定します。</dd>
<dt>discordRoleId</dt>
  <dd>discordで通知する宛先のRole IDを設定します。</dd>
</dl>

---

7. スクリプトを起動します。例ではバックグラウンドに落としていますが、デーモン化したい場合は適宜デーモン化してください。
ex)
```bash
(./twitch-notifier.js -d) &
```

## その他諸注意
* ログがlogs/twitch-notifier.logに書き出されます。
  また、ログのローテーションが日付単位で行われます。ログを書き込むイベントが発生した際に日付が変わっていた場合ローテーションが行われます。
