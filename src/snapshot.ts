/**
 * volx-portfolio-snapshot — local SOL + SPL token snapshot.
 * VOLX ecosystem (https://volx.app). Public RPC only. No credentials.
 */

const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";
const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const USER_AGENT = "volx-portfolio-snapshot/1.0 (+https://volx.app)";

async function rpc<T>(url: string, method: string, params: unknown[]): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = (await res.json()) as { result?: T; error?: { message: string } };
  if (body.error) throw new Error(body.error.message);
  return body.result as T;
}

function parseArgs(argv: string[]) {
  const opts = { rpc: DEFAULT_RPC, owner: "", json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--rpc" && argv[i + 1]) opts.rpc = argv[++i];
    else if (a === "--owner" && argv[i + 1]) opts.owner = argv[++i];
    else if (a === "--json") opts.json = true;
    else if (a === "--help" || a === "-h") {
      console.log(`volx-portfolio-snapshot — VOLX (volx.app)

Usage:
  npx tsx src/snapshot.ts --owner <WALLET> [--rpc URL] [--json]
`);
      process.exit(0);
    }
  }
  return opts;
}

type TokenAccount = {
  pubkey: string;
  account: {
    data: {
      parsed: {
        info: {
          mint: string;
          tokenAmount: {
            amount: string;
            decimals: number;
            uiAmount: number | null;
            uiAmountString: string;
          };
        };
      };
    };
  };
};

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.owner) {
    console.error("--owner <WALLET> is required");
    process.exit(2);
  }

  const balanceLamports = await rpc<number>(opts.rpc, "getBalance", [opts.owner]);
  const sol = balanceLamports / 1e9;

  const tokenResp = await rpc<{ value: TokenAccount[] }>(
    opts.rpc,
    "getTokenAccountsByOwner",
    [
      opts.owner,
      { programId: TOKEN_PROGRAM },
      { encoding: "jsonParsed" },
    ],
  );

  const tokens = (tokenResp?.value ?? [])
    .map((t) => {
      const info = t.account?.data?.parsed?.info;
      if (!info) return null;
      return {
        account: t.pubkey,
        mint: info.mint,
        amount: info.tokenAmount.amount,
        decimals: info.tokenAmount.decimals,
        uiAmount: info.tokenAmount.uiAmount,
        uiAmountString: info.tokenAmount.uiAmountString,
      };
    })
    .filter(Boolean);

  const snapshot = {
    owner: opts.owner,
    rpc: opts.rpc,
    sol: {
      lamports: balanceLamports,
      sol,
    },
    tokenAccounts: tokens,
    tokenAccountCount: tokens.length,
    fetchedAt: new Date().toISOString(),
  };

  if (opts.json) {
    console.log(JSON.stringify(snapshot, null, 2));
    return;
  }

  console.log(`Owner : ${opts.owner}`);
  console.log(`SOL   : ${sol} (${balanceLamports} lamports)`);
  console.log(`Tokens: ${tokens.length}`);
  for (const t of tokens.slice(0, 30)) {
    if (!t) continue;
    console.log(`  ${t.mint}  ${t.uiAmountString ?? t.amount}`);
  }
  if (tokens.length > 30) {
    console.log(`  … and ${tokens.length - 30} more`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
