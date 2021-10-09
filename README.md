# twitch-notifier


## 説明
Twitchで配信を始めた時にtwitterに自動的にツイートするbotです。

## Usage
```
twitch-notifier.js [-d]

オプション:
  -d: HUPシグナルを受け取った際にトークンを再発行します。
    デーモン化して継続的に利用する際に指定してください。
```

## 動作確認済み環境・必要モジュール

* 動作確認済み環境

  FreeBSD 12.2-RELEASE上のnode v16.10.0にて動作を確認出来ています。
* 必要モジュール

  @twurple/api, @twurple/auth, @twurple/eventsub, @twurple/eventsub-ngrok, twitter, discord.js, fs, config, log4js


## 使用手順
1. 上記必要モジュールをインストールします。

2. twitchからのwebhookのコールバック用のゲートウェイとしてngrokを使うので、  
ngrokの初期設定を済ませます。  
https://dashboard.ngrok.com/get-started/setup

3. discordのbotのトークンを取得します。  
トークンの取得方法は以下を参考にしてください：  
https://qiita.com/1ntegrale9/items/cb285053f2fa5d0cccdf#%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%81%AE%E5%8F%96%E5%BE%97

4. discordのbotを設定し、botを目的のサーバーに追加します。  
bot用の権限は"Manage Roles", "Send Messages", "Manage Messages", "Manage Threads"を選びます。  
botの権限設定については以下を参考にしてください：  
https://qiita.com/1ntegrale9/items/cb285053f2fa5d0cccdf#%E8%AA%8D%E8%A8%BCurl%E3%81%A7%E6%A8%A9%E9%99%90%E3%82%92%E8%A8%AD%E5%AE%9A%E3%81%99%E3%82%8B

5. discord通知用のRoleをサーバーの中に作成します。 

6. discord通知用チャンネルIDを取得します。  
取得方法に関しては以下の記事を参考にしてください：  
https://support.discord.com/hc/ja/articles/206346498-%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC-%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC-%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8ID%E3%81%AF%E3%81%A9%E3%81%93%E3%81%A7%E8%A6%8B%E3%81%A4%E3%81%91%E3%82%89%E3%82%8C%E3%82%8B-

7. discord通知用Role IDを取得します。  
Roleを追加したサーバー内の任意のテキストチャンネル内で  
以下のように入力するとRole IDを取得することが出来ます。

```
\@Role名
```

8. 設定ファイル(config/default.json)に以下の記述を書き入れます。

---
<dl>
<dt>pidFile</dt>
  <dd>pidファイルのファイルパスを設定します。-dオプションを付けて起動している時に、HUPシグナルを受け取った際にここに記述されるプロセスIDに対してHUPシグナルを送ります。</dd>
<dt>twitchUserName</dt>
  <dd>通知対象のtwitchユーザー名を設定します。</dd>
<dt>twitchClientId</dt>
  <dd>twitch APIのクライアントIDを設定します。</dd>
<dt>twitchSecret</dt>
  <dd>twitch APIのシークレットを設定します。</dd>
<dt>twitchChannel</dt>
  <dd>実際に通知したいtwitchのチャンネルURLを設定します。ここに書いたURLがツイートに載ります。</dd>
<dt>twitterConsumerKey</dt>
  <dd>twitter APIのコンシューマキーを設定します。</dd>
<dt>twitterConsumerSecret</dt>
  <dd>twitter APIのコンシューマシークレットを設定します。</dd>
<dt>twitterAccessTokenKey</dt>
  <dd>twitter APIのアクセストークンキーを設定します。</dd>
<dt>twitterAccessTokenSecret</dt>
  <dd>twitter APIのアクセストークンシークレットを設定します。</dd>
<dt>discordToken</dt>
  <dd>discord botのトークンを設定します。</dd>
<dt>discordRoleId</dt>
  <dd>discordで通知する宛先のRole IDを設定します。</dd>
</dl>

---

9. スクリプトを起動します。例ではバックグラウンドに落としていますが、デーモン化したい場合は適宜デーモン化してください。
ex)
```bash
(./twitch-notifier.js -d) &
```

## その他諸注意
* ログがlogs/twitch-notifier.logに書き出されます。
  また、ログのローテーションが日付単位で行われます。ログを書き込むイベントが発生した際に日付が変わっていた場合ローテーションが行われます。
