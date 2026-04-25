const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { supabase } = require('../../lib/supabase.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sessions')
    .setDescription('View upcoming customs sessions')
    .addStringOption(o => o.setName('community').setDescription('Community slug (optional)')),

  async execute(interaction) {
    await interaction.deferReply()

    const slug = interaction.options.getString('community')

    let query = supabase
      .from('sessions')
      .select('id, title, description, status, scheduled_at, communities(name, slug)')
      .in('status', ['open', 'draft'])
      .order('scheduled_at', { ascending: true })
      .limit(5)

    if (slug) {
      const { data: community } = await supabase
        .from('communities')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!community) {
        return interaction.editReply(`❌ Community **${slug}** not found.`)
      }
      query = query.eq('community_id', community.id)
    }

    const { data: sessions } = await query

    if (!sessions?.length) {
      return interaction.editReply('No upcoming sessions found.')
    }

    const embed = new EmbedBuilder()
      .setColor('#ff4444')
      .setTitle('🎮 Upcoming Customs Sessions')
      .setDescription(sessions.map(s =>
        `**${s.title}** — ${s.communities?.name || 'Unknown'}\n` +
        `Status: \`${s.status}\` ${s.scheduled_at ? `• <t:${Math.floor(new Date(s.scheduled_at).getTime() / 1000)}:R>` : ''}`
      ).join('\n\n'))
      .setFooter({ text: 'recoilcustoms.com' })

    await interaction.editReply({ embeds: [embed] })
  }
}
