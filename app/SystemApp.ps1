param(
    [switch]$SmokeTest
)

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

[xml]$xaml = @"
<Window
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    Title="Self Improvement Labs - System Prototype"
    Width="1120"
    Height="760"
    MinWidth="940"
    MinHeight="620"
    WindowStartupLocation="CenterScreen"
    Background="#0B0F17"
    FontFamily="Segoe UI"
    Foreground="#E6EDF3">
    <Window.Resources>
        <Style TargetType="Button">
            <Setter Property="Background" Value="#151B27"/>
            <Setter Property="Foreground" Value="#E6EDF3"/>
            <Setter Property="BorderBrush" Value="#2B3444"/>
            <Setter Property="BorderThickness" Value="1"/>
            <Setter Property="Padding" Value="14,10"/>
            <Setter Property="Margin" Value="0,0,0,10"/>
            <Setter Property="HorizontalContentAlignment" Value="Left"/>
            <Setter Property="Cursor" Value="Hand"/>
            <Setter Property="Template">
                <Setter.Value>
                    <ControlTemplate TargetType="Button">
                        <Border Background="{TemplateBinding Background}" BorderBrush="{TemplateBinding BorderBrush}" BorderThickness="{TemplateBinding BorderThickness}" CornerRadius="8">
                            <ContentPresenter HorizontalAlignment="{TemplateBinding HorizontalContentAlignment}" VerticalAlignment="Center" Margin="{TemplateBinding Padding}"/>
                        </Border>
                    </ControlTemplate>
                </Setter.Value>
            </Setter>
        </Style>
        <Style x:Key="Panel" TargetType="Border">
            <Setter Property="Background" Value="#111827"/>
            <Setter Property="BorderBrush" Value="#243044"/>
            <Setter Property="BorderThickness" Value="1"/>
            <Setter Property="CornerRadius" Value="10"/>
            <Setter Property="Padding" Value="18"/>
            <Setter Property="Margin" Value="0,0,0,14"/>
        </Style>
        <Style x:Key="Muted" TargetType="TextBlock">
            <Setter Property="Foreground" Value="#8B949E"/>
            <Setter Property="TextWrapping" Value="Wrap"/>
            <Setter Property="LineHeight" Value="20"/>
        </Style>
        <Style x:Key="Label" TargetType="TextBlock">
            <Setter Property="Foreground" Value="#8B949E"/>
            <Setter Property="FontSize" Value="12"/>
            <Setter Property="TextWrapping" Value="Wrap"/>
        </Style>
        <Style x:Key="Value" TargetType="TextBlock">
            <Setter Property="Foreground" Value="#E6EDF3"/>
            <Setter Property="FontSize" Value="22"/>
            <Setter Property="FontWeight" Value="SemiBold"/>
        </Style>
        <Style TargetType="TextBox">
            <Setter Property="Background" Value="#0F1724"/>
            <Setter Property="Foreground" Value="#E6EDF3"/>
            <Setter Property="BorderBrush" Value="#2B3444"/>
            <Setter Property="BorderThickness" Value="1"/>
            <Setter Property="Padding" Value="10"/>
            <Setter Property="Margin" Value="0,6,0,12"/>
        </Style>
        <Style TargetType="ProgressBar">
            <Setter Property="Foreground" Value="#58A6FF"/>
            <Setter Property="Background" Value="#0F1724"/>
            <Setter Property="BorderBrush" Value="#2B3444"/>
            <Setter Property="Height" Value="10"/>
        </Style>
    </Window.Resources>

    <Grid>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="260"/>
            <ColumnDefinition Width="*"/>
        </Grid.ColumnDefinitions>

        <Border Grid.Column="0" Background="#090D14" BorderBrush="#1F2937" BorderThickness="0,0,1,0" Padding="22">
            <DockPanel LastChildFill="True">
                <StackPanel DockPanel.Dock="Top">
                    <TextBlock Text="SYSTEM" FontSize="28" FontWeight="Bold" Foreground="#58A6FF"/>
                    <TextBlock Text="Self Improvement Labs" Foreground="#8B949E" Margin="0,2,0,26"/>

                    <Button x:Name="ProfileButton" Content="Profile"/>
                    <Button x:Name="InterviewButton" Content="Interview"/>
                    <Button x:Name="QuestsButton" Content="Quests"/>
                    <Button x:Name="InventoryButton" Content="Inventory"/>
                    <Button x:Name="SkillsButton" Content="Skills"/>
                </StackPanel>

                <Border DockPanel.Dock="Bottom" Background="#0F1724" BorderBrush="#263244" BorderThickness="1" CornerRadius="10" Padding="14">
                    <StackPanel>
                        <TextBlock Text="Prototype Status" FontWeight="SemiBold"/>
                        <TextBlock Text="The app window opens. Data is not saved yet." Style="{StaticResource Muted}" Margin="0,6,0,0"/>
                    </StackPanel>
                </Border>
            </DockPanel>
        </Border>

        <ScrollViewer Grid.Column="1" VerticalScrollBarVisibility="Auto">
            <Grid Margin="28">
                <Grid.RowDefinitions>
                    <RowDefinition Height="Auto"/>
                    <RowDefinition Height="*"/>
                </Grid.RowDefinitions>

                <DockPanel Grid.Row="0" Margin="0,0,0,22">
                    <StackPanel>
                        <TextBlock x:Name="PageTitle" Text="Player Profile" FontSize="34" FontWeight="Bold"/>
                        <TextBlock x:Name="PageSubtitle" Text="A draft screen for a real-life RPG system." Style="{StaticResource Muted}" Margin="0,6,0,0"/>
                    </StackPanel>
                </DockPanel>

                <Grid Grid.Row="1">
                    <Grid x:Name="ProfilePage">
                        <Grid.ColumnDefinitions>
                            <ColumnDefinition Width="1.1*"/>
                            <ColumnDefinition Width="0.9*"/>
                        </Grid.ColumnDefinitions>

                        <StackPanel Grid.Column="0" Margin="0,0,18,0">
                            <Border Style="{StaticResource Panel}">
                                <Grid>
                                    <Grid.ColumnDefinitions>
                                        <ColumnDefinition Width="150"/>
                                        <ColumnDefinition Width="*"/>
                                    </Grid.ColumnDefinitions>
                                    <Border Width="124" Height="124" CornerRadius="16" BorderBrush="#58A6FF" BorderThickness="2" Background="#0F1724">
                                        <Grid>
                                            <TextBlock Text="LV" FontSize="18" Foreground="#8B949E" HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,-26,0,0"/>
                                            <TextBlock Text="01" FontSize="44" FontWeight="Bold" Foreground="#58A6FF" HorizontalAlignment="Center" VerticalAlignment="Center" Margin="0,20,0,0"/>
                                        </Grid>
                                    </Border>
                                    <StackPanel Grid.Column="1" VerticalAlignment="Center">
                                        <TextBlock Text="New Character" FontSize="28" FontWeight="Bold"/>
                                        <TextBlock Text="Class: unassigned" Style="{StaticResource Muted}" Margin="0,6,0,12"/>
                                        <TextBlock Text="XP to next level" Style="{StaticResource Label}"/>
                                        <ProgressBar Value="18" Maximum="100" Margin="0,8,0,0"/>
                                    </StackPanel>
                                </Grid>
                            </Border>

                            <Border Style="{StaticResource Panel}">
                                <StackPanel>
                                    <TextBlock Text="Stats" FontSize="20" FontWeight="SemiBold" Margin="0,0,0,14"/>
                                    <UniformGrid Columns="3" Rows="2">
                                        <StackPanel Margin="0,0,16,14">
                                            <TextBlock Text="Focus" Style="{StaticResource Label}"/>
                                            <TextBlock Text="3" Style="{StaticResource Value}"/>
                                        </StackPanel>
                                        <StackPanel Margin="0,0,16,14">
                                            <TextBlock Text="Body" Style="{StaticResource Label}"/>
                                            <TextBlock Text="2" Style="{StaticResource Value}"/>
                                        </StackPanel>
                                        <StackPanel Margin="0,0,16,14">
                                            <TextBlock Text="Will" Style="{StaticResource Label}"/>
                                            <TextBlock Text="4" Style="{StaticResource Value}"/>
                                        </StackPanel>
                                        <StackPanel Margin="0,0,16,0">
                                            <TextBlock Text="Social" Style="{StaticResource Label}"/>
                                            <TextBlock Text="2" Style="{StaticResource Value}"/>
                                        </StackPanel>
                                        <StackPanel Margin="0,0,16,0">
                                            <TextBlock Text="Creative" Style="{StaticResource Label}"/>
                                            <TextBlock Text="5" Style="{StaticResource Value}"/>
                                        </StackPanel>
                                        <StackPanel Margin="0,0,16,0">
                                            <TextBlock Text="Discipline" Style="{StaticResource Label}"/>
                                            <TextBlock Text="1" Style="{StaticResource Value}"/>
                                        </StackPanel>
                                    </UniformGrid>
                                </StackPanel>
                            </Border>
                        </StackPanel>

                        <StackPanel Grid.Column="1">
                            <Border Style="{StaticResource Panel}">
                                <StackPanel>
                                    <TextBlock Text="Today" FontSize="20" FontWeight="SemiBold" Margin="0,0,0,12"/>
                                    <CheckBox Content="10 minutes of movement" Foreground="#E6EDF3" Margin="0,0,0,8"/>
                                    <CheckBox Content="One deep work block" Foreground="#E6EDF3" Margin="0,0,0,8"/>
                                    <CheckBox Content="Write a short day log" Foreground="#E6EDF3"/>
                                </StackPanel>
                            </Border>

                            <Border Style="{StaticResource Panel}">
                                <StackPanel>
                                    <TextBlock Text="Inventory" FontSize="20" FontWeight="SemiBold" Margin="0,0,0,12"/>
                                    <TextBlock Text="Empty slot" Style="{StaticResource Muted}" Margin="0,0,0,8"/>
                                    <TextBlock Text="Empty slot" Style="{StaticResource Muted}" Margin="0,0,0,8"/>
                                    <TextBlock Text="Empty slot" Style="{StaticResource Muted}"/>
                                </StackPanel>
                            </Border>
                        </StackPanel>
                    </Grid>

                    <Grid x:Name="InterviewPage" Visibility="Collapsed">
                        <Grid.ColumnDefinitions>
                            <ColumnDefinition Width="*"/>
                            <ColumnDefinition Width="320"/>
                        </Grid.ColumnDefinitions>
                        <Border Grid.Column="0" Style="{StaticResource Panel}" Margin="0,0,18,0">
                            <StackPanel>
                                <TextBlock Text="Entry Interview" FontSize="22" FontWeight="SemiBold" Margin="0,0,0,12"/>
                                <TextBlock Text="This screen will later collect lifestyle, goals, pain points, and preferred system aesthetics." Style="{StaticResource Muted}" Margin="0,0,0,16"/>
                                <TextBlock Text="Which life area should level up first?" Style="{StaticResource Label}"/>
                                <TextBox Text="Energy, money, body, learning, relationships"/>
                                <TextBlock Text="What breaks progress most often?" Style="{StaticResource Label}"/>
                                <TextBox Height="90" TextWrapping="Wrap" AcceptsReturn="True"/>
                                <TextBlock Text="What tone should the system use?" Style="{StaticResource Label}"/>
                                <TextBox Text="Strict coach, calm mentor, dark RPG, science lab"/>
                                <Button x:Name="CreateProfileButton" Content="Create Draft Profile" HorizontalContentAlignment="Center" Margin="0,8,0,0"/>
                            </StackPanel>
                        </Border>
                        <Border Grid.Column="1" Style="{StaticResource Panel}">
                            <StackPanel>
                                <TextBlock Text="Generation Idea" FontSize="20" FontWeight="SemiBold" Margin="0,0,0,10"/>
                                <TextBlock Text="Answers will become a character class, starting stats, daily quests, and weak spots." Style="{StaticResource Muted}"/>
                            </StackPanel>
                        </Border>
                    </Grid>

                    <Grid x:Name="QuestsPage" Visibility="Collapsed">
                        <Border Style="{StaticResource Panel}">
                            <StackPanel>
                                <TextBlock Text="Quests" FontSize="22" FontWeight="SemiBold" Margin="0,0,0,14"/>
                                <TextBlock Text="Daily" Style="{StaticResource Label}"/>
                                <CheckBox Content="Complete one small step toward the main goal" Foreground="#E6EDF3" Margin="0,10,0,8"/>
                                <CheckBox Content="Clear one source of chaos: file, task, or thought" Foreground="#E6EDF3" Margin="0,0,0,8"/>
                                <CheckBox Content="Close the day with a short report" Foreground="#E6EDF3" Margin="0,0,0,18"/>
                                <TextBlock Text="Story Arcs" Style="{StaticResource Label}"/>
                                <TextBlock Text="No arc selected yet. Long task chains will appear here later." Style="{StaticResource Muted}" Margin="0,8,0,0"/>
                            </StackPanel>
                        </Border>
                    </Grid>

                    <Grid x:Name="InventoryPage" Visibility="Collapsed">
                        <Border Style="{StaticResource Panel}">
                            <StackPanel>
                                <TextBlock Text="Inventory" FontSize="22" FontWeight="SemiBold" Margin="0,0,0,14"/>
                                <UniformGrid Columns="4" Rows="3">
                                    <Border Background="#0F1724" BorderBrush="#2B3444" BorderThickness="1" CornerRadius="8" Height="86" Margin="0,0,10,10">
                                        <TextBlock Text="Empty" Foreground="#8B949E" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                                    </Border>
                                    <Border Background="#0F1724" BorderBrush="#2B3444" BorderThickness="1" CornerRadius="8" Height="86" Margin="0,0,10,10">
                                        <TextBlock Text="Empty" Foreground="#8B949E" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                                    </Border>
                                    <Border Background="#0F1724" BorderBrush="#2B3444" BorderThickness="1" CornerRadius="8" Height="86" Margin="0,0,10,10">
                                        <TextBlock Text="Empty" Foreground="#8B949E" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                                    </Border>
                                    <Border Background="#0F1724" BorderBrush="#2B3444" BorderThickness="1" CornerRadius="8" Height="86" Margin="0,0,10,10">
                                        <TextBlock Text="Empty" Foreground="#8B949E" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                                    </Border>
                                    <Border Background="#0F1724" BorderBrush="#2B3444" BorderThickness="1" CornerRadius="8" Height="86" Margin="0,0,10,10">
                                        <TextBlock Text="Empty" Foreground="#8B949E" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                                    </Border>
                                    <Border Background="#0F1724" BorderBrush="#2B3444" BorderThickness="1" CornerRadius="8" Height="86" Margin="0,0,10,10">
                                        <TextBlock Text="Empty" Foreground="#8B949E" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                                    </Border>
                                    <Border Background="#0F1724" BorderBrush="#2B3444" BorderThickness="1" CornerRadius="8" Height="86" Margin="0,0,10,10">
                                        <TextBlock Text="Empty" Foreground="#8B949E" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                                    </Border>
                                    <Border Background="#0F1724" BorderBrush="#2B3444" BorderThickness="1" CornerRadius="8" Height="86" Margin="0,0,10,10">
                                        <TextBlock Text="Empty" Foreground="#8B949E" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                                    </Border>
                                </UniformGrid>
                            </StackPanel>
                        </Border>
                    </Grid>

                    <Grid x:Name="SkillsPage" Visibility="Collapsed">
                        <Border Style="{StaticResource Panel}">
                            <StackPanel>
                                <TextBlock Text="Skills" FontSize="22" FontWeight="SemiBold" Margin="0,0,0,14"/>
                                <TextBlock Text="Focus" Style="{StaticResource Label}"/>
                                <ProgressBar Value="35" Maximum="100" Margin="0,8,0,14"/>
                                <TextBlock Text="Physical Energy" Style="{StaticResource Label}"/>
                                <ProgressBar Value="22" Maximum="100" Margin="0,8,0,14"/>
                                <TextBlock Text="Project Building" Style="{StaticResource Label}"/>
                                <ProgressBar Value="48" Maximum="100" Margin="0,8,0,14"/>
                                <TextBlock Text="Self-Reflection" Style="{StaticResource Label}"/>
                                <ProgressBar Value="60" Maximum="100" Margin="0,8,0,0"/>
                            </StackPanel>
                        </Border>
                    </Grid>
                </Grid>
            </Grid>
        </ScrollViewer>
    </Grid>
</Window>
"@

$reader = New-Object System.Xml.XmlNodeReader $xaml
$window = [Windows.Markup.XamlReader]::Load($reader)

$pages = @{
    Profile = $window.FindName("ProfilePage")
    Interview = $window.FindName("InterviewPage")
    Quests = $window.FindName("QuestsPage")
    Inventory = $window.FindName("InventoryPage")
    Skills = $window.FindName("SkillsPage")
}

$title = $window.FindName("PageTitle")
$subtitle = $window.FindName("PageSubtitle")

function Show-Page {
    param(
        [string]$Name,
        [string]$TitleText,
        [string]$SubtitleText
    )

    foreach ($page in $pages.Values) {
        $page.Visibility = "Collapsed"
    }

    $pages[$Name].Visibility = "Visible"
    $title.Text = $TitleText
    $subtitle.Text = $SubtitleText
}

$window.FindName("ProfileButton").Add_Click({
    Show-Page "Profile" "Player Profile" "A draft screen for a real-life RPG system."
})

$window.FindName("InterviewButton").Add_Click({
    Show-Page "Interview" "Entry Interview" "The user answers questions and the system creates the first build."
})

$window.FindName("QuestsButton").Add_Click({
    Show-Page "Quests" "Quests" "Daily tasks, story arcs, and rewards for real actions."
})

$window.FindName("InventoryButton").Add_Click({
    Show-Page "Inventory" "Inventory" "Future items, artifacts, notes, rewards, and resources."
})

$window.FindName("SkillsButton").Add_Click({
    Show-Page "Skills" "Skills" "Progress across real abilities, habits, and life domains."
})

$window.FindName("CreateProfileButton").Add_Click({
    [System.Windows.MessageBox]::Show(
        "This is still a shell. The next step is saving answers and generating starting stats.",
        "System Prototype",
        "OK",
        "Information"
    ) | Out-Null
})

if ($SmokeTest) {
    "System prototype smoke test OK"
    $window.Close()
    return
}

$window.ShowDialog() | Out-Null
