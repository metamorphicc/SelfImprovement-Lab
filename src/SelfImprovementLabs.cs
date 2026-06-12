using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text.RegularExpressions;
using System.Windows.Forms;

namespace SelfImprovementLabs
{
    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
    }

    public sealed class MainForm : Form
    {
        private readonly Color background = Color.FromArgb(8, 11, 16);
        private readonly Color sidebar = Color.FromArgb(9, 13, 20);
        private readonly Color panel = Color.FromArgb(17, 24, 35);
        private readonly Color panelAlt = Color.FromArgb(21, 29, 40);
        private readonly Color line = Color.FromArgb(37, 50, 68);
        private readonly Color text = Color.FromArgb(237, 242, 247);
        private readonly Color muted = Color.FromArgb(143, 155, 170);
        private readonly Color blue = Color.FromArgb(88, 166, 255);
        private readonly Color green = Color.FromArgb(93, 228, 161);

        private readonly Panel content;
        private readonly Label pageTitle;
        private readonly Label pageSubtitle;
        private readonly Dictionary<string, Panel> pages = new Dictionary<string, Panel>();
        private readonly List<Button> navButtons = new List<Button>();
        private readonly List<Wallet> wallets = new List<Wallet>();

        private Label walletCount;
        private Label portfolioTotal;
        private Label evmTotal;
        private Label solanaTotal;
        private NumericUpDown thresholdInput;
        private FlowLayoutPanel walletList;
        private DataGridView assetTable;

        public MainForm()
        {
            Text = "Self Improvement Labs";
            Width = 1180;
            Height = 780;
            MinimumSize = new Size(980, 640);
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = background;
            ForeColor = text;
            Font = new Font("Segoe UI", 9F);

            var shell = new TableLayoutPanel();
            shell.Dock = DockStyle.Fill;
            shell.ColumnCount = 2;
            shell.RowCount = 1;
            shell.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 260F));
            shell.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));
            Controls.Add(shell);

            shell.Controls.Add(BuildSidebar(), 0, 0);

            var workspace = new Panel();
            workspace.Dock = DockStyle.Fill;
            workspace.BackColor = background;
            workspace.Padding = new Padding(28, 24, 28, 24);
            shell.Controls.Add(workspace, 1, 0);

            pageTitle = new Label();
            pageTitle.AutoSize = false;
            pageTitle.Height = 46;
            pageTitle.Dock = DockStyle.Top;
            pageTitle.Font = new Font("Segoe UI", 25F, FontStyle.Bold);
            pageTitle.ForeColor = text;

            pageSubtitle = new Label();
            pageSubtitle.AutoSize = false;
            pageSubtitle.Height = 32;
            pageSubtitle.Dock = DockStyle.Top;
            pageSubtitle.Font = new Font("Segoe UI", 10F);
            pageSubtitle.ForeColor = muted;

            content = new Panel();
            content.Dock = DockStyle.Fill;
            content.Padding = new Padding(0, 18, 0, 0);
            content.BackColor = background;

            workspace.Controls.Add(content);
            workspace.Controls.Add(pageSubtitle);
            workspace.Controls.Add(pageTitle);

            pages["profile"] = BuildProfilePage();
            pages["interview"] = BuildInterviewPage();
            pages["wallets"] = BuildWalletsPage();
            pages["inventory"] = BuildInventoryPage();
            pages["quests"] = BuildPlaceholderPage("Quests", "Daily missions, story arcs, rewards, and streaks will live here.");
            pages["skills"] = BuildPlaceholderPage("Skills", "Skill trees for focus, body, money, relationships, learning, and projects.");
            pages["knowledge"] = BuildPlaceholderPage("Knowledge Base", "A structured second brain for notes, rules, decisions, links, and references.");
            pages["settings"] = BuildPlaceholderPage("Settings", "Theme, privacy, API providers, exports, and backups.");

            foreach (var page in pages.Values)
            {
                page.Dock = DockStyle.Fill;
                page.Visible = false;
                content.Controls.Add(page);
            }

            ShowPage("profile", "Player Profile", "A personal RPG shell for real-life progression.");
            RefreshWalletUi();
        }

        private Control BuildSidebar()
        {
            var side = new Panel();
            side.Dock = DockStyle.Fill;
            side.BackColor = sidebar;
            side.Padding = new Padding(22);

            var brand = new Label();
            brand.Text = "SYSTEM";
            brand.Dock = DockStyle.Top;
            brand.Height = 34;
            brand.Font = new Font("Segoe UI", 22F, FontStyle.Bold);
            brand.ForeColor = blue;

            var sub = new Label();
            sub.Text = "Self Improvement Labs";
            sub.Dock = DockStyle.Top;
            sub.Height = 34;
            sub.ForeColor = muted;

            var nav = new FlowLayoutPanel();
            nav.Dock = DockStyle.Top;
            nav.Height = 390;
            nav.FlowDirection = FlowDirection.TopDown;
            nav.WrapContents = false;
            nav.Padding = new Padding(0, 18, 0, 0);

            AddNav(nav, "profile", "Profile");
            AddNav(nav, "interview", "Interview");
            AddNav(nav, "wallets", "Wallets");
            AddNav(nav, "inventory", "Inventory");
            AddNav(nav, "quests", "Quests");
            AddNav(nav, "skills", "Skills");
            AddNav(nav, "knowledge", "Knowledge");
            AddNav(nav, "settings", "Settings");

            var status = MakePanel();
            status.Dock = DockStyle.Bottom;
            status.Height = 112;
            status.Padding = new Padding(14);

            var statusTitle = MakeLabel("Prototype Status", 10F, FontStyle.Bold, text);
            statusTitle.Dock = DockStyle.Top;
            statusTitle.Height = 24;
            var statusText = MakeLabel("This build opens as a real app window. Data is still local prototype data.", 9F, FontStyle.Regular, muted);
            statusText.Dock = DockStyle.Fill;

            status.Controls.Add(statusText);
            status.Controls.Add(statusTitle);

            side.Controls.Add(status);
            side.Controls.Add(nav);
            side.Controls.Add(sub);
            side.Controls.Add(brand);
            return side;
        }

        private void AddNav(FlowLayoutPanel nav, string page, string label)
        {
            var button = new Button();
            button.Text = label;
            button.Tag = page;
            button.Width = 210;
            button.Height = 38;
            button.FlatStyle = FlatStyle.Flat;
            button.FlatAppearance.BorderColor = line;
            button.FlatAppearance.BorderSize = 1;
            button.BackColor = panelAlt;
            button.ForeColor = text;
            button.TextAlign = ContentAlignment.MiddleLeft;
            button.Margin = new Padding(0, 0, 0, 10);
            button.Padding = new Padding(10, 0, 0, 0);
            button.Click += delegate { Navigate((string)button.Tag); };
            navButtons.Add(button);
            nav.Controls.Add(button);
        }

        private Panel BuildProfilePage()
        {
            var page = new Panel();
            page.BackColor = background;

            var layout = new TableLayoutPanel();
            layout.Dock = DockStyle.Fill;
            layout.ColumnCount = 2;
            layout.RowCount = 2;
            layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 58F));
            layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 42F));
            layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 170F));
            layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100F));
            layout.Padding = new Padding(0);
            page.Controls.Add(layout);

            var hero = MakePanel();
            hero.Margin = new Padding(0, 0, 12, 14);
            hero.Padding = new Padding(24);
            layout.Controls.Add(hero, 0, 0);

            var heroTitle = MakeLabel("New Character", 27F, FontStyle.Bold, text);
            heroTitle.Dock = DockStyle.Top;
            heroTitle.Height = 46;
            var heroSub = MakeLabel("Class: unassigned. Complete the interview to generate your first build.", 10F, FontStyle.Regular, muted);
            heroSub.Dock = DockStyle.Top;
            heroSub.Height = 28;
            var xp = new ProgressBar();
            xp.Dock = DockStyle.Bottom;
            xp.Height = 12;
            xp.Value = 18;
            hero.Controls.Add(xp);
            hero.Controls.Add(heroSub);
            hero.Controls.Add(heroTitle);

            var today = MakePanel();
            today.Margin = new Padding(6, 0, 0, 14);
            today.Padding = new Padding(18);
            layout.Controls.Add(today, 1, 0);
            today.Controls.Add(MakeCheck("Write a short day log"));
            today.Controls.Add(MakeCheck("One deep work block"));
            today.Controls.Add(MakeCheck("Ten minutes of movement"));
            var todayTitle = MakeLabel("Today", 15F, FontStyle.Bold, text);
            todayTitle.Dock = DockStyle.Top;
            todayTitle.Height = 34;
            today.Controls.Add(todayTitle);

            var stats = MakePanel();
            stats.Margin = new Padding(0, 0, 12, 0);
            stats.Padding = new Padding(18);
            layout.Controls.Add(stats, 0, 1);

            var statsGrid = new TableLayoutPanel();
            statsGrid.Dock = DockStyle.Fill;
            statsGrid.ColumnCount = 3;
            statsGrid.RowCount = 2;
            for (int i = 0; i < 3; i++) statsGrid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 33.33F));
            for (int i = 0; i < 2; i++) statsGrid.RowStyles.Add(new RowStyle(SizeType.Percent, 50F));
            statsGrid.Controls.Add(MakeStat("Focus", "3"), 0, 0);
            statsGrid.Controls.Add(MakeStat("Body", "2"), 1, 0);
            statsGrid.Controls.Add(MakeStat("Will", "4"), 2, 0);
            statsGrid.Controls.Add(MakeStat("Social", "2"), 0, 1);
            statsGrid.Controls.Add(MakeStat("Creative", "5"), 1, 1);
            statsGrid.Controls.Add(MakeStat("Discipline", "1"), 2, 1);
            stats.Controls.Add(statsGrid);

            var assets = MakePanel();
            assets.Margin = new Padding(6, 0, 0, 0);
            assets.Padding = new Padding(18);
            layout.Controls.Add(assets, 1, 1);
            walletCount = MakeLabel("0 addresses", 9F, FontStyle.Regular, muted);
            walletCount.Dock = DockStyle.Top;
            walletCount.Height = 24;
            portfolioTotal = MakeLabel("$0.00", 32F, FontStyle.Bold, text);
            portfolioTotal.Dock = DockStyle.Top;
            portfolioTotal.Height = 64;
            evmTotal = MakeLabel("EVM: $0.00", 11F, FontStyle.Bold, green);
            evmTotal.Dock = DockStyle.Top;
            evmTotal.Height = 30;
            solanaTotal = MakeLabel("Solana: $0.00", 11F, FontStyle.Bold, blue);
            solanaTotal.Dock = DockStyle.Top;
            solanaTotal.Height = 30;
            var assetTitle = MakeLabel("Asset Overview", 15F, FontStyle.Bold, text);
            assetTitle.Dock = DockStyle.Top;
            assetTitle.Height = 34;
            assets.Controls.Add(solanaTotal);
            assets.Controls.Add(evmTotal);
            assets.Controls.Add(portfolioTotal);
            assets.Controls.Add(walletCount);
            assets.Controls.Add(assetTitle);

            return page;
        }

        private Panel BuildInterviewPage()
        {
            var page = new Panel();
            page.BackColor = background;
            var box = MakePanel();
            box.Dock = DockStyle.Top;
            box.Height = 390;
            box.Padding = new Padding(20);
            page.Controls.Add(box);

            box.Controls.Add(MakeTextBox("What tone should the system use? Strict coach, calm mentor, dark RPG, lab dashboard."));
            box.Controls.Add(MakeQuestion("What tone do you want from the system?"));
            box.Controls.Add(MakeTextBox("Low energy, chaotic notes, money fog, distraction, lack of structure."));
            box.Controls.Add(MakeQuestion("What breaks your progress most often?"));
            box.Controls.Add(MakeTextBox("Energy, money, body, learning, relationships, projects."));
            box.Controls.Add(MakeQuestion("Which life area should level up first?"));
            var intro = MakeLabel("The interview will later generate class, stats, daily quests, weak spots, and starting inventory.", 10F, FontStyle.Regular, muted);
            intro.Dock = DockStyle.Top;
            intro.Height = 46;
            box.Controls.Add(intro);
            var title = MakeLabel("Entry Interview", 17F, FontStyle.Bold, text);
            title.Dock = DockStyle.Top;
            title.Height = 38;
            box.Controls.Add(title);
            return page;
        }

        private Panel BuildWalletsPage()
        {
            var page = new Panel();
            page.BackColor = background;
            var layout = new TableLayoutPanel();
            layout.Dock = DockStyle.Fill;
            layout.ColumnCount = 2;
            layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 42F));
            layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 58F));
            page.Controls.Add(layout);

            var left = MakePanel();
            left.Padding = new Padding(18);
            left.Margin = new Padding(0, 0, 12, 0);
            layout.Controls.Add(left, 0, 0);

            var nameInput = MakeInput();
            nameInput.Text = "Main wallet";
            var chainInput = new ComboBox();
            chainInput.DropDownStyle = ComboBoxStyle.DropDownList;
            chainInput.Items.AddRange(new object[] { "EVM", "Solana" });
            chainInput.SelectedIndex = 0;
            chainInput.Dock = DockStyle.Top;
            chainInput.Height = 34;
            var addressInput = MakeInput();
            addressInput.Text = "0x0000000000000000000000000000000000000000";
            var add = MakePrimaryButton("Add Address");
            add.Click += delegate
            {
                AddWallet(nameInput.Text.Trim(), chainInput.Text, addressInput.Text.Trim());
            };

            walletList = new FlowLayoutPanel();
            walletList.Dock = DockStyle.Fill;
            walletList.FlowDirection = FlowDirection.TopDown;
            walletList.WrapContents = false;
            walletList.AutoScroll = true;

            left.Controls.Add(walletList);
            left.Controls.Add(add);
            left.Controls.Add(MakeSpacer(10));
            left.Controls.Add(addressInput);
            left.Controls.Add(MakeQuestion("Address"));
            left.Controls.Add(chainInput);
            left.Controls.Add(MakeQuestion("Network"));
            left.Controls.Add(nameInput);
            left.Controls.Add(MakeQuestion("Label"));
            left.Controls.Add(MakeSectionTitle("Connected Addresses"));

            var right = MakePanel();
            right.Padding = new Padding(18);
            right.Margin = new Padding(6, 0, 0, 0);
            layout.Controls.Add(right, 1, 0);

            thresholdInput = new NumericUpDown();
            thresholdInput.Dock = DockStyle.Top;
            thresholdInput.Minimum = 0;
            thresholdInput.Maximum = 100000;
            thresholdInput.DecimalPlaces = 2;
            thresholdInput.Value = 1;
            thresholdInput.Height = 34;
            thresholdInput.ValueChanged += delegate { RefreshWalletUi(); };

            assetTable = new DataGridView();
            assetTable.Dock = DockStyle.Fill;
            assetTable.BackgroundColor = panel;
            assetTable.BorderStyle = BorderStyle.None;
            assetTable.EnableHeadersVisualStyles = false;
            assetTable.ColumnHeadersDefaultCellStyle.BackColor = panelAlt;
            assetTable.ColumnHeadersDefaultCellStyle.ForeColor = text;
            assetTable.DefaultCellStyle.BackColor = panel;
            assetTable.DefaultCellStyle.ForeColor = text;
            assetTable.DefaultCellStyle.SelectionBackColor = Color.FromArgb(34, 60, 90);
            assetTable.DefaultCellStyle.SelectionForeColor = text;
            assetTable.RowHeadersVisible = false;
            assetTable.AllowUserToAddRows = false;
            assetTable.ReadOnly = true;
            assetTable.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            assetTable.Columns.Add("Token", "Token");
            assetTable.Columns.Add("Network", "Network");
            assetTable.Columns.Add("Balance", "Balance");
            assetTable.Columns.Add("Usd", "USD");

            right.Controls.Add(assetTable);
            right.Controls.Add(MakeSpacer(10));
            right.Controls.Add(thresholdInput);
            right.Controls.Add(MakeQuestion("USD threshold"));
            right.Controls.Add(MakeSectionTitle("Assets"));
            return page;
        }

        private Panel BuildInventoryPage()
        {
            var page = new Panel();
            page.BackColor = background;
            var grid = new TableLayoutPanel();
            grid.Dock = DockStyle.Fill;
            grid.ColumnCount = 4;
            grid.RowCount = 2;
            for (int i = 0; i < 4; i++) grid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 25F));
            for (int i = 0; i < 2; i++) grid.RowStyles.Add(new RowStyle(SizeType.Percent, 50F));
            page.Controls.Add(grid);

            string[] items = { "Documents", "Ideas", "Resources", "Contacts", "Artifacts", "Purchases", "Projects", "Empty Slot" };
            for (int i = 0; i < items.Length; i++)
            {
                var slot = MakePanel();
                slot.Margin = new Padding(0, 0, 12, 12);
                var label = MakeLabel(items[i], 12F, FontStyle.Bold, text);
                label.Dock = DockStyle.Fill;
                label.TextAlign = ContentAlignment.MiddleCenter;
                slot.Controls.Add(label);
                grid.Controls.Add(slot, i % 4, i / 4);
            }

            return page;
        }

        private Panel BuildPlaceholderPage(string title, string body)
        {
            var page = new Panel();
            page.BackColor = background;
            var box = MakePanel();
            box.Dock = DockStyle.Top;
            box.Height = 170;
            box.Padding = new Padding(22);
            page.Controls.Add(box);
            var headline = MakeLabel(title, 24F, FontStyle.Bold, text);
            headline.Dock = DockStyle.Top;
            headline.Height = 48;
            var copy = MakeLabel(body, 11F, FontStyle.Regular, muted);
            copy.Dock = DockStyle.Top;
            copy.Height = 60;
            box.Controls.Add(copy);
            box.Controls.Add(headline);
            return page;
        }

        private void Navigate(string page)
        {
            if (page == "profile") ShowPage(page, "Player Profile", "A personal RPG shell for real-life progression.");
            if (page == "interview") ShowPage(page, "Entry Interview", "Answer questions, then generate the first version of your character.");
            if (page == "wallets") ShowPage(page, "Wallets and Assets", "Track EVM and Solana addresses from one personal dashboard.");
            if (page == "inventory") ShowPage(page, "Inventory", "A hard inventory of your files, resources, projects, and useful things.");
            if (page == "quests") ShowPage(page, "Quests", "Daily missions, story arcs, streaks, and rewards.");
            if (page == "skills") ShowPage(page, "Skills", "Real-life abilities represented as progress tracks.");
            if (page == "knowledge") ShowPage(page, "Knowledge Base", "Your second brain, but with structure and game logic.");
            if (page == "settings") ShowPage(page, "Settings", "Privacy, providers, exports, backups, and app preferences.");
        }

        private void ShowPage(string name, string title, string subtitle)
        {
            foreach (var item in pages) item.Value.Visible = item.Key == name;
            foreach (var button in navButtons)
            {
                bool active = (string)button.Tag == name;
                button.BackColor = active ? Color.FromArgb(27, 39, 56) : panelAlt;
                button.ForeColor = active ? blue : text;
            }

            pageTitle.Text = title;
            pageSubtitle.Text = subtitle;
        }

        private void AddWallet(string label, string chain, string address)
        {
            if (String.IsNullOrWhiteSpace(label)) label = chain + " wallet";
            if (!IsValidAddress(chain, address))
            {
                MessageBox.Show("Address format does not look valid for " + chain + ".", "Wallets", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            if (wallets.Any(w => w.Chain == chain && String.Equals(w.Address, address, StringComparison.OrdinalIgnoreCase)))
            {
                MessageBox.Show("This address is already in the list.", "Wallets", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            wallets.Add(new Wallet(label, chain, address));
            RefreshWalletUi();
        }

        private bool IsValidAddress(string chain, string address)
        {
            if (chain == "EVM") return Regex.IsMatch(address, "^0x[a-fA-F0-9]{40}$");
            return Regex.IsMatch(address, "^[1-9A-HJ-NP-Za-km-z]{32,44}$");
        }

        private void RefreshWalletUi()
        {
            if (walletList != null)
            {
                walletList.Controls.Clear();
                if (wallets.Count == 0)
                {
                    walletList.Controls.Add(MakeWalletCard("No addresses yet", "Add your first EVM or Solana wallet."));
                }
                else
                {
                    foreach (var wallet in wallets)
                    {
                        walletList.Controls.Add(MakeWalletCard(wallet.Label + " - " + wallet.Chain, ShortAddress(wallet.Address)));
                    }
                }
            }

            var assets = wallets.SelectMany(MakeDemoAssets).ToList();
            double threshold = thresholdInput == null ? 1D : Decimal.ToDouble(thresholdInput.Value);
            var visible = assets.Where(a => a.Value >= threshold).OrderByDescending(a => a.Value).ToList();

            if (assetTable != null)
            {
                assetTable.Rows.Clear();
                foreach (var asset in visible)
                {
                    assetTable.Rows.Add(asset.Symbol, asset.Chain, FormatAmount(asset.Amount), FormatUsd(asset.Value));
                }
            }

            double total = assets.Sum(a => a.Value);
            double evm = assets.Where(a => a.Chain == "EVM").Sum(a => a.Value);
            double sol = assets.Where(a => a.Chain == "Solana").Sum(a => a.Value);

            if (walletCount != null) walletCount.Text = wallets.Count == 1 ? "1 address" : wallets.Count + " addresses";
            if (portfolioTotal != null) portfolioTotal.Text = FormatUsd(total);
            if (evmTotal != null) evmTotal.Text = "EVM: " + FormatUsd(evm);
            if (solanaTotal != null) solanaTotal.Text = "Solana: " + FormatUsd(sol);
        }

        private IEnumerable<Asset> MakeDemoAssets(Wallet wallet)
        {
            var tokens = wallet.Chain == "EVM"
                ? new[] { new Token("ETH", 3520), new Token("USDC", 1), new Token("ARB", 1.35), new Token("LINK", 18.4) }
                : new[] { new Token("SOL", 165), new Token("USDC", 1), new Token("JUP", 1.18), new Token("PYTH", 0.48) };

            int seed = Math.Abs((wallet.Chain + wallet.Address).GetHashCode());
            for (int i = 0; i < tokens.Length; i++)
            {
                double baseAmount = ((seed >> (i % 10)) % 870) / 100D;
                double amount = tokens[i].Price > 100 ? baseAmount / 8D : baseAmount * 3D;
                yield return new Asset(tokens[i].Symbol, wallet.Chain, amount, amount * tokens[i].Price);
            }
        }

        private string ShortAddress(string address)
        {
            if (address.Length <= 14) return address;
            return address.Substring(0, 6) + "..." + address.Substring(address.Length - 6);
        }

        private string FormatUsd(double value)
        {
            return "$" + value.ToString(value >= 100 ? "N0" : "N2");
        }

        private string FormatAmount(double value)
        {
            if (value >= 1000) return value.ToString("N0");
            if (value >= 1) return value.ToString("N3");
            return value.ToString("N6");
        }

        private Panel MakePanel()
        {
            var box = new Panel();
            box.BackColor = panel;
            box.BorderStyle = BorderStyle.FixedSingle;
            return box;
        }

        private Label MakeLabel(string value, float size, FontStyle style, Color color)
        {
            var label = new Label();
            label.Text = value;
            label.ForeColor = color;
            label.Font = new Font("Segoe UI", size, style);
            label.AutoEllipsis = true;
            return label;
        }

        private Label MakeSectionTitle(string value)
        {
            var label = MakeLabel(value, 15F, FontStyle.Bold, text);
            label.Dock = DockStyle.Top;
            label.Height = 38;
            return label;
        }

        private Label MakeQuestion(string value)
        {
            var label = MakeLabel(value, 9F, FontStyle.Regular, muted);
            label.Dock = DockStyle.Top;
            label.Height = 24;
            return label;
        }

        private TextBox MakeInput()
        {
            var input = new TextBox();
            input.Dock = DockStyle.Top;
            input.Height = 30;
            input.BackColor = Color.FromArgb(12, 18, 27);
            input.ForeColor = text;
            input.BorderStyle = BorderStyle.FixedSingle;
            return input;
        }

        private TextBox MakeTextBox(string value)
        {
            var input = MakeInput();
            input.Text = value;
            input.Height = 38;
            return input;
        }

        private Control MakeSpacer(int height)
        {
            var spacer = new Panel();
            spacer.Dock = DockStyle.Top;
            spacer.Height = height;
            return spacer;
        }

        private CheckBox MakeCheck(string value)
        {
            var check = new CheckBox();
            check.Text = value;
            check.Dock = DockStyle.Top;
            check.Height = 30;
            check.ForeColor = text;
            return check;
        }

        private Button MakePrimaryButton(string value)
        {
            var button = new Button();
            button.Text = value;
            button.Dock = DockStyle.Top;
            button.Height = 42;
            button.FlatStyle = FlatStyle.Flat;
            button.FlatAppearance.BorderSize = 0;
            button.BackColor = blue;
            button.ForeColor = Color.FromArgb(6, 16, 31);
            button.Font = new Font("Segoe UI", 10F, FontStyle.Bold);
            return button;
        }

        private Panel MakeStat(string label, string value)
        {
            var box = MakePanel();
            box.Margin = new Padding(0, 0, 12, 12);
            box.Padding = new Padding(14);
            var name = MakeLabel(label, 9F, FontStyle.Regular, muted);
            name.Dock = DockStyle.Top;
            name.Height = 24;
            var score = MakeLabel(value, 22F, FontStyle.Bold, text);
            score.Dock = DockStyle.Top;
            score.Height = 42;
            box.Controls.Add(score);
            box.Controls.Add(name);
            return box;
        }

        private Panel MakeWalletCard(string title, string subtitle)
        {
            var card = MakePanel();
            card.Width = 330;
            card.Height = 66;
            card.Margin = new Padding(0, 0, 0, 10);
            card.Padding = new Padding(12);
            var t = MakeLabel(title, 10F, FontStyle.Bold, text);
            t.Dock = DockStyle.Top;
            t.Height = 24;
            var s = MakeLabel(subtitle, 8.5F, FontStyle.Regular, muted);
            s.Dock = DockStyle.Top;
            s.Height = 22;
            card.Controls.Add(s);
            card.Controls.Add(t);
            return card;
        }

        private sealed class Wallet
        {
            public readonly string Label;
            public readonly string Chain;
            public readonly string Address;

            public Wallet(string label, string chain, string address)
            {
                Label = label;
                Chain = chain;
                Address = address;
            }
        }

        private sealed class Token
        {
            public readonly string Symbol;
            public readonly double Price;

            public Token(string symbol, double price)
            {
                Symbol = symbol;
                Price = price;
            }
        }

        private sealed class Asset
        {
            public readonly string Symbol;
            public readonly string Chain;
            public readonly double Amount;
            public readonly double Value;

            public Asset(string symbol, string chain, double amount, double value)
            {
                Symbol = symbol;
                Chain = chain;
                Amount = amount;
                Value = value;
            }
        }
    }
}
