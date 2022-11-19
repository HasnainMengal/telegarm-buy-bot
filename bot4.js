const TelegramBot = require("node-telegram-bot-api");
const token = "5673540010:AAE6mSpCLPMsotltmWYSBk_vCbQ2XQ3sreo";
const bot = new TelegramBot(token, { polling: true });
const axios = require("axios");
const ethers = require("ethers");
const abi = require("./abi.json");
const abiDecoder = require("abi-decoder");
const JSONdb = require("simple-json-db");

const db = new JSONdb("./address.json");

const { TransactionTypes, accessListify } = require("ethers/lib/utils");
try{ 
bot.onText(/\/addtoken/, async (msg) => {
  const Group_id = msg.chat.id;
  const token_prompt = await bot.sendMessage(
    msg.chat.id,
    "Paste Your BSC token address",
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
  bot.onReplyToMessage(Group_id, token_prompt.message_id, async (token) => {
    if (token.text?.startsWith("0x")) {
      var _token = token.text;

      const ask = await bot.sendMessage(
        msg.chat.id,
        "if you want to set an image/video Click yes, and  if you do not want to set an image/video, then please Click no ",
        {
          reply_markup: {
            resize_keyboard: true,
            one_time_keyboard: true,
            keyboard: [["yes", "no"]],
          },
        }
      );
      bot.onReplyToMessage(msg.chat.id, ask.message_id, async (nameMsg) => {
        const _ask = nameMsg.text;
        if (_ask === "no") {
          save_token_and_chain_id(Group_id, _token);
          db.set(_token.toUpperCase(), _token);
          db.sync();
          // save name in DB if you want to ...
          await bot.sendMessage(
            msg.chat.id,
            `Thx For Your Support Bot Started Now`
          );
        }
        if (_ask === "yes") {
          const file_promt = await bot.sendMessage(
            msg.chat.id,
            "Send Here image/video",
            {
              reply_markup: {
                force_reply: true,
              },
            }
          );
          bot.onReplyToMessage(
            msg.chat.id,
            file_promt.message_id,
            async (nameMsg) => {
              if ("photo" in nameMsg) {
                const fileLink = await bot.getFile(nameMsg.photo[0]?.file_id);
                save_img(
                  _token,
                  Group_id.toString(),
                  fileLink.file_id,
                  "Image"
                );
                db.set(_token.toUpperCase(), _token);
                db.sync();

                await bot.sendMessage(
                  msg.chat.id,
                  `Thx For Your Support Bot Started Now`
                );
              }
              if ("video" in nameMsg) {
                const fileLink = await bot.getFile(nameMsg.video.file_id);
                console.log(fileLink);
                save_img(
                  _token,
                  Group_id.toString(),
                  fileLink.file_id,
                  "Video"
                );
                db.set(_token.toUpperCase(), _token);
                db.sync();
                await bot.sendMessage(
                  msg.chat.id,
                  `Thx For Your Support Bot Started Now`
                );
              }
            }
          );
        }
      });
    }
  });
});
// Saving Functions
function save_token_and_chain_id(chat_id, token_address) {
  console.log(chat_id);
  console.log(token_address);
  const Chat_ids_arrays = [chat_id.toString()];
  const data = JSON.stringify({
    collection: "bot",
    database: "bot",
    dataSource: "Cluster0",
    filter: {
      token: token_address.toUpperCase(),
    },
  });

  const config = {
    method: "post",
    url: "https://data.mongodb-api.com/app/data-cukug/endpoint/data/v1/action/findOne",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Request-Headers": "*",
      "api-key":
        "5LCyDQy9wRPBULDlCdeUeT18CHv2E56Wcpe6QlYi8LmNyu3s1OPX06ttmx5nPxYl",
      Accept: "application/ejson",
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      var res = response.data.document;
      if (response.data.document === null) {
        const data = JSON.stringify({
          collection: "bot",
          database: "bot",

          dataSource: "Cluster0",
          document: {
            token: token_address.toUpperCase(),
            Group_id: Chat_ids_arrays,
            file_link: ["none"],
            Type: ["none"],
          },
        });
        // https://data.mongodb-api.com/app/data-cukug/endpoint/data/v1

        const config = {
          method: "post",
          url: "https://data.mongodb-api.com/app/data-cukug/endpoint/data/v1/action/insertOne",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Request-Headers": "*",
            "api-key":
              "5LCyDQy9wRPBULDlCdeUeT18CHv2E56Wcpe6QlYi8LmNyu3s1OPX06ttmx5nPxYl",
            Accept: "application/ejson",
          },
          data: data,
        };

        axios(config).then(function (_response) {
          // console.log(JSON.stringify(response.data));
        });
      } else {
        const db_array = res.Group_id;
        const file_err = res.file_link;
        const type_err = res.Type;
        console.log(db_array);
        file_err.push("none");
        type_err.push("none");

        db_array.push(chat_id.toString());

        const data = JSON.stringify({
          collection: "bot",
          database: "bot",

          dataSource: "Cluster0",

          filter: {
            token: token_address.toUpperCase(),
          },
        });
        // https://data.mongodb-api.com/app/data-cukug/endpoint/data/v1

        const config = {
          method: "post",
          url: "https://data.mongodb-api.com/app/data-cukug/endpoint/data/v1/action/deleteOne",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Request-Headers": "*",
            "api-key":
              "5LCyDQy9wRPBULDlCdeUeT18CHv2E56Wcpe6QlYi8LmNyu3s1OPX06ttmx5nPxYl",
            Accept: "application/ejson",
          },
          data: data,
        };

        axios(config).then(function (response) {
          const data = JSON.stringify({
            collection: "bot",
            database: "bot",

            dataSource: "Cluster0",
            document: {
              token: token_address.toUpperCase(),
              Group_id: db_array,
              file_link: file_err,
              Type: type_err,
            },
          });
          // https://data.mongodb-api.com/app/data-cukug/endpoint/data/v1

          const config = {
            method: "post",
            url: "https://data.mongodb-api.com/app/data-cukug/endpoint/data/v1/action/insertOne",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Request-Headers": "*",
              "api-key":
                "5LCyDQy9wRPBULDlCdeUeT18CHv2E56Wcpe6QlYi8LmNyu3s1OPX06ttmx5nPxYl",
              Accept: "application/ejson",
            },
            data: data,
          };

          axios(config).then(function (response) {});
        });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function save_img(token, _Group_id, _file, _Type) {
  console.log(token);
  const data = JSON.stringify({
    collection: "bot",
    database: "bot",
    dataSource: "Cluster0",
    filter: {
      token: token.toUpperCase(),
    },
  });

  const config = {
    method: "post",
    url: "https://data.mongodb-api.com/app/data-cukug/endpoint/data/v1/action/findOne",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Request-Headers": "*",
      "api-key":
        "5LCyDQy9wRPBULDlCdeUeT18CHv2E56Wcpe6QlYi8LmNyu3s1OPX06ttmx5nPxYl",
      Accept: "application/ejson",
    },
    data: data,
  };

  axios(config).then(function (response) {
    const _res = response.data.document;
    console.log(_res);

    var Group_id_ = _res?.Group_id || [];
    var file_link_ = _res?.file_link || [];
    var Type_ = _res?.Type || [];
    Group_id_?.push(_Group_id);
    file_link_?.push(_file);
    Type_?.push(_Type);

    const data = JSON.stringify({
      collection: "bot",
      database: "bot",
      dataSource: "Cluster0",
      filter: {
        token: token.toUpperCase(),
      },
    });

    const config = {
      method: "post",
      url: "https://data.mongodb-api.com/app/data-cukug/endpoint/data/v1/action/deleteOne",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Headers": "*",
        "api-key":
          "5LCyDQy9wRPBULDlCdeUeT18CHv2E56Wcpe6QlYi8LmNyu3s1OPX06ttmx5nPxYl",
        Accept: "application/ejson",
      },
      data: data,
    };

    axios(config).then(function (response) {
      const data = JSON.stringify({
        collection: "bot",
        database: "bot",

        dataSource: "Cluster0",
        document: {
          token: token.toUpperCase(),
          Group_id: Group_id_,
          file_link: file_link_,
          Type: Type_,
        },
      });
      // https://data.mongodb-api.com/app/data-cukug/endpoint/data/v1

      const config = {
        method: "post",
        url: "https://data.mongodb-api.com/app/data-cukug/endpoint/data/v1/action/insertOne",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Request-Headers": "*",
          "api-key":
            "5LCyDQy9wRPBULDlCdeUeT18CHv2E56Wcpe6QlYi8LmNyu3s1OPX06ttmx5nPxYl",
          Accept: "application/ejson",
        },
        data: data,
      };

      axios(config).then(function (response) {
        // console.log(JSON.stringify(response.data));
        console.log(response.data);
      });
    });
  });
}

/////////////////////////////////////////////////////////////////////

async function main() {
  try{
  const rpc = new ethers.providers.WebSocketProvider(
   "wss://lively-responsive-silence.bsc.discover.quiknode.pro/dbeaba09b6c24a9adde788d2b68c4eb9218a1a9e/"
   );

  let urls = ["https://bscrpc.com","https://bsc-dataseed1.binance.org/","https://bsc-dataseed2.binance.org/",
"https://bsc-mainnet.gateway.pokt.network/v1/lb/a6445c08a3f1e4db5c567ef9" ];
let wss = ["wss://ws-nd-760-700-151.p2pify.com/86454c833859b479ec879180ac58d335","wss://warmhearted-light-patron.bsc.discover.quiknode.pro/aeec40e8f5c2dbe7af9f224768b3b5a527e0020b/"]

  rpc.on("pending", (txHash) => {
   // var url = wss[Math.floor(Math.random()*wss.length)];
  
//let customHttpProvider = new ethers.providers.JsonRpcProvider(url);
//onst customHttpProvider = new ethers.providers.WebSocketProvider(url)




rpc.getTransaction(txHash).then((tx) => {
      if (tx === null) return;
      const { from, to, value, hash, data } = tx;
      if (to === "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3") {
        const hash = tx.hash;
        const data = tx.data;

        const from = tx.from;
        const value = ethers.utils.formatEther(tx.value);

        getInputs(data, from, hash, value);

        {
        }
      } 
    }) 
  });
}catch{

}
}
main();
async function getInputs(data, from, hash, value) {
  try {
    if (value > 0) {
      abiDecoder.addABI(abi);

      let decoded_data = await abiDecoder.decodeMethod(data);

      let params = decoded_data.params;
      const amount_got = params[0].value;
      const path = params[1].value;
      const last_element = path[path.length - 1];
      check_token(last_element, amount_got, from, hash);
    } else {
      abiDecoder.addABI(abi);

      let decoded_data = await abiDecoder.decodeMethod(data);

      let params = decoded_data.params;
      const amount_got = params[1].value;
      const path = params[2].value;
      const last_element = path[path.length - 1];
      check_token(last_element, amount_got, from, hash);
    }
  } catch (err) {
    console.log(err);
    console.log(hash);
  }
}
async function check_token(token_address, amount_got, from, hash) {
  const have = db.has(token_address.toUpperCase());
 ;
  if (have === true) {
   
    console.log(token_address +  + " " +  "Sending Data");
    //console.log(token_address.toUpperCase());
    var data = JSON.stringify({
      collection: "bot",
      database: "bot",
      dataSource: "Cluster0",
      filter: {
        token: token_address.toUpperCase(),
      },
    });

    var config = {
      method: "post",
      url: "https://data.mongodb-api.com/app/data-cukug/endpoint/data/v1/action/findOne",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Headers": "*",
        "api-key":
          "5LCyDQy9wRPBULDlCdeUeT18CHv2E56Wcpe6QlYi8LmNyu3s1OPX06ttmx5nPxYl",
        Accept: "application/ejson",
      },
      data: data,
    };

    axios(config).then(function (response) {
      var data = response.data.document;
      const len_group = response.data.document.Group_id.length;
      if (response.data.document != null) {
        const options = {
          method: "GET",
          url:
            "https://deep-index.moralis.io/api/v2/erc20/" +
            "0xe9e7cea3dedca5984780bafc599bd69add087d56" +
            "/price",
          params: { chain: "bsc" },
          headers: {
            accept: "application/json",
            "X-API-Key":
              "pJqedlgbiaCUeMQ44X1GSDXVVM2cFnj9nFp3HcpFytnNdbl7NhR3cxIHX6n3CffD",
          },
        };

        axios.request(options).then(function (response) {
          var _response = response.data.usdPrice;
          var spent = _response * amount_got;
          const options = {
            method: "GET",
            url: "https://deep-index.moralis.io/api/v2/erc20/metadata",
            params: {
              chain: "0x61",
              addresses: token_address,
            },
            headers: {
              accept: "application/json",
              "X-API-Key":
                "pJqedlgbiaCUeMQ44X1GSDXVVM2cFnj9nFp3HcpFytnNdbl7NhR3cxIHX6n3CffD",
            },
          };

          axios.request(options).then(function (new_response) {
            let i = 0;
            for (; i < len_group; i++) {
              async function sleep() {
                await new Promise(r => setTimeout(r, 1000));

              }
              sleep()

              const Chat_id = data.Group_id[i];
              console.log(Chat_id);
              const file_link = data.file_link[i];
              const Type = data.Type[i];

              var buyaddress = "https://bscscan.com/address/" + from;
              var charts = "https://poocoin.app/tokens/" + token_address;
              var pancake_adress =
                "https://bscscan.com/address/0x10ed43c718714eb63d5aa57b78b54704e256024e";

              var hash_link = "https://bscscan.com/tx/" + hash;
              var name = new_response.data[0].name;
              if (Type === "none") {
                bot.sendMessage(
                  Chat_id,

                  "<strong>Token: " +
                    name +
                    "</strong>" +
                    " \n" +
                    "<strong>🚀🚀🚀🚀🚀🚀🚀</strong>" +
                    " \n" +
                    "<strong>GOT:" +
                    ethers.utils.formatEther(amount_got.toString()) +
                    "</strong>" +
                    " \n" +
                    "<strong>Buy:" +
                    name +
                    "</strong>" +
                    " \n" +
                    "<strong>Spent:" +
                    spent +
                    "$</strong>" +
                    " \n" +
                    "<strong>Price:" +
                    _response +
                    "  </strong>" +
                    " \n" +
                    "<strong>Mcap:23223.23$</strong>" +
                    " \n" +
                    `<a href="${hash_link}">TX</a>` +
                    "<strong>  | </strong>" +
                    `<a href="${charts}">Chart</a>` +
                    "<strong>  | </strong>" +
                    `<a href="${buyaddress}">Buyer</a>` +
                    "<strong>  | </strong>" +
                    `<a href="${pancake_adress}">Pancake</a>`,

                  { parse_mode: "HTML" }
                );
              }
              if (Type === "Image") {
                bot.sendPhoto(Chat_id, file_link, {
                  caption:
                    "<strong>Token: " +
                    name +
                    "</strong>" +
                    " \n" +
                    "<strong>🚀🚀🚀🚀🚀🚀🚀</strong>" +
                    " \n" +
                    "<strong>GOT:" +
                    ethers.utils.formatEther(amount_got.toString()) +
                    "</strong>" +
                    " \n" +
                    "<strong>Buy:" +
                    name +
                    "</strong>" +
                    " \n" +
                    "<strong>Spent:" +
                    spent +
                    "$</strong>" +
                    " \n" +
                    "<strong>Price:" +
                    _response +
                    "  </strong>" +
                    " \n" +
                    "<strong>Mcap:23223.23$</strong>" +
                    " \n" +
                    `<a href="${hash_link}">TX</a>` +
                    "<strong>  | </strong>" +
                    `<a href="${charts}">Chart</a>` +
                    "<strong>  | </strong>" +
                    `<a href="${buyaddress}">Buyer</a>` +
                    "<strong>  | </strong>" +
                    `<a href="${pancake_adress}">Pancake</a>`,

                  parse_mode: "HTML",
                });
                if (Type === "Video") {
                  bot.sendVideo(Chat_id, file_link, {
                    caption:
                      "<strong>Token: " +
                      name +
                      "</strong>" +
                      " \n" +
                      "<strong>🚀🚀🚀🚀🚀🚀🚀</strong>" +
                      " \n" +
                      "<strong>GOT:" +
                      ethers.utils.formatEther(amount_got.toString()) +
                      "</strong>" +
                      " \n" +
                      "<strong>Buy:" +
                      name +
                      "</strong>" +
                      " \n" +
                      "<strong>Spent:" +
                      spent +
                      "$</strong>" +
                      " \n" +
                      "<strong>Price:" +
                      _response +
                      "  </strong>" +
                      " \n" +
                      "<strong>Mcap:23223.23$</strong>" +
                      " \n" +
                      `<a href="${hash_link}">TX</a>` +
                      "<strong>  | </strong>" +
                      `<a href="${charts}">Chart</a>` +
                      "<strong>  | </strong>" +
                      `<a href="${buyaddress}">Buyer</a>` +
                      "<strong>  | </strong>" +
                      `<a href="${pancake_adress}">Pancake</a>`,

                    parse_mode: "HTML",
                  });
                }
              }
            }
          });
        });
      }
    });
  }
}
 }catch(err) {
  console.log(err)

 }
