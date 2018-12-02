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

  FreeBSD 11.2-RELEASE上のnode v8.12.0にて動作を確認出来ています。
* 必要モジュール

  twitch-webhook, twitter, request, fs, config, log4js


## 使用手順
1. 上記必要モジュールをインストールします。

2. config/default.jsonに適当な値を入力します。
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
</dl>

---

3. スクリプトを起動します。例ではバックグラウンドに落としていますが、デーモン化したい場合は適宜デーモン化してください。
ex)
```bash
(./twitch-notifier.js -d) &
```

## その他諸注意
* ログがlogs/twitch-notifier.logに書き出されます。
  また、ログのローテーションが日付単位で行われます。ログを書き込むイベントが発生した際に日付が変わっていた場合ローテーションが行われます。
